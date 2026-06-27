use serde::{Deserialize, Serialize};
use serde_json::json;
use std::io::{self, BufRead, Write};
use windows::{
    Win32::Foundation::*,
    Win32::System::ProcessStatus::*,
    Win32::System::Threading::*,
    Win32::UI::WindowsAndMessaging::*,
    Win32::Graphics::Gdi::*,
    Win32::UI::Controls::*,
};

#[derive(Serialize, Deserialize, Debug, Clone)]
struct WindowContext {
    #[serde(rename = "browserTabTitle")]
    title: String,
    #[serde(rename = "processName")]
    process_name: String,
    #[serde(rename = "caretPosition")]
    caret_position: usize,
    #[serde(rename = "contextText", skip_serializing_if = "Option::is_none")]
    context_text: Option<String>,
}

fn main() {
    let stdin = io::stdin();
    let mut stdout = io::stdout();

    for line in stdin.lock().lines() {
        if let Ok(input) = line {
            let response = handle_command(&input);
            let output =
                serde_json::to_string(&response).unwrap_or_else(|_| json!({"error": "json error"}).to_string());
            writeln!(stdout, "{}", output).unwrap();
            stdout.flush().unwrap();
        }
    }
}

fn handle_command(input: &str) -> serde_json::Value {
    #[derive(Deserialize)]
    struct Command {
        command: String,
    }

    if let Ok(cmd) = serde_json::from_str::<Command>(input) {
        if cmd.command == "getFocusedWindow" {
            if let Some(ctx) = get_window_context() {
                json!(ctx)
            } else {
                json!({"error": "no focused window"})
            }
        } else {
            json!({"error": "unknown command", "received": cmd.command})
        }
    } else {
        json!({"error": "invalid json"})
    }
}

fn get_window_context() -> Option<WindowContext> {
    unsafe {
        let hwnd = GetForegroundWindow();
        if hwnd.0.is_null() {
            return None;
        }

        let mut title_buf: [u16; 512] = [0; 512];
        let title_len = GetWindowTextW(hwnd, &mut title_buf);
        let title = if title_len > 0 {
            String::from_utf16_lossy(&title_buf[..title_len as usize])
        } else {
            String::new()
        };

        let mut pid: u32 = 0;
        let _ = GetWindowThreadProcessId(hwnd, Some(&mut pid));
        let process_name = get_process_name(pid);

        let caret_position = get_caret_position(hwnd);
        let context_text = get_context_text(hwnd);

        Some(WindowContext {
            title,
            process_name,
            caret_position,
            context_text,
        })
    }
}

fn get_process_name(pid: u32) -> String {
    unsafe {
        let process = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, false, pid);
        let Ok(process) = process else {
            return String::new();
        };

        let mut name_buf: [u16; 512] = [0; 512];
        let len = GetModuleBaseNameW(process, HMODULE(std::ptr::null_mut()), &mut name_buf);
        let name = if len > 0 {
            String::from_utf16_lossy(&name_buf[..len as usize])
        } else {
            String::new()
        };

        let _ = CloseHandle(process);
        name
    }
}

fn get_caret_position(hwnd: HWND) -> usize {
    unsafe {
        let mut info = GUITHREADINFO {
            cbSize: std::mem::size_of::<GUITHREADINFO>() as u32,
            flags: GUITHREADINFO_FLAGS(0),
            hwndActive: HWND(std::ptr::null_mut()),
            hwndFocus: HWND(std::ptr::null_mut()),
            hwndCapture: HWND(std::ptr::null_mut()),
            hwndMenuOwner: HWND(std::ptr::null_mut()),
            hwndCaret: HWND(std::ptr::null_mut()),
            hwndMoveSize: HWND(std::ptr::null_mut()),
            rcCaret: RECT {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
            },
        };

        let thread_id = GetWindowThreadProcessId(hwnd, Some(std::ptr::null_mut()));
        if GetGUIThreadInfo(thread_id, &mut info).is_err() {
            return 0;
        }

        if info.hwndCaret.0.is_null() {
            return 0;
        }

        let mut client_pt = POINT {
            x: info.rcCaret.left,
            y: info.rcCaret.top,
        };
        if ScreenToClient(info.hwndFocus, &mut client_pt) != TRUE {
            return 0;
        }

        let lparam = ((client_pt.y << 16) as usize) | (client_pt.x as usize & 0xFFFF);
        let result = SendMessageW(
            info.hwndFocus,
            EM_POSFROMCHAR,
            WPARAM(lparam),
            LPARAM(0),
        );

        TryInto::<usize>::try_into(result.0).unwrap_or(0)
    }
}

fn get_context_text(hwnd: HWND) -> Option<String> {
    unsafe {
        let mut info = GUITHREADINFO {
            cbSize: std::mem::size_of::<GUITHREADINFO>() as u32,
            flags: GUITHREADINFO_FLAGS(0),
            hwndActive: HWND(std::ptr::null_mut()),
            hwndFocus: HWND(std::ptr::null_mut()),
            hwndCapture: HWND(std::ptr::null_mut()),
            hwndMenuOwner: HWND(std::ptr::null_mut()),
            hwndCaret: HWND(std::ptr::null_mut()),
            hwndMoveSize: HWND(std::ptr::null_mut()),
            rcCaret: RECT {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
            },
        };

        let thread_id = GetWindowThreadProcessId(hwnd, Some(std::ptr::null_mut()));
        if GetGUIThreadInfo(thread_id, &mut info).is_err() {
            return None;
        }

        let control = info.hwndFocus;
        if control.0.is_null() {
            return None;
        }

        let len = SendMessageW(control, WM_GETTEXTLENGTH, WPARAM(0), LPARAM(0));
        let len: usize = len.0.try_into().unwrap_or(0);
        if len == 0 {
            return Some(String::new());
        }

        let mut buf: Vec<u16> = vec![0; len + 1];
        let copied = SendMessageW(
            control,
            WM_GETTEXT,
            WPARAM(buf.len()),
            LPARAM(buf.as_mut_ptr() as isize),
        );
        let copied: usize = copied.0.try_into().unwrap_or(0);
        buf.truncate(copied);
        Some(String::from_utf16_lossy(&buf))
    }
}
