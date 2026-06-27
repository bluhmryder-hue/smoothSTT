use serde::Deserialize;
use serde_json::json;
use std::io::{self, BufRead, Write};
use windows::{
    Win32::Foundation::*,
    Win32::UI::Input::KeyboardAndMouse::*,
    Win32::UI::WindowsAndMessaging::*,
};

#[derive(Debug, Deserialize)]
struct Command {
    action: String,
    #[serde(default)]
    text: String,
    #[serde(default)]
    requestId: Option<u64>,
}

fn emit(event: serde_json::Value) {
    let mut out = io::stdout();
    let _ = writeln!(out, "{}", event);
    let _ = out.flush();
}

fn send_input_unicode(text: &str) -> bool {
    unsafe {
        let mut inputs = Vec::new();
        for ch in text.chars() {
            let code = ch as u16;
            inputs.push(INPUT {
                r#type: INPUT_KEYBOARD,
                Anonymous: INPUT_0 {
                    ki: KEYBDINPUT {
                        wVk: VIRTUAL_KEY(0),
                        wScan: code,
                        dwFlags: KEYEVENTF_UNICODE,
                        time: 0,
                        dwExtraInfo: 0,
                    },
                },
            });
        }

        let sent = SendInput(&inputs, std::mem::size_of::<INPUT>() as i32);
        sent == inputs.len() as u32
    }
}

fn send_ctrl_v() -> bool {
    unsafe {
        let ctrl_down = INPUT {
            r#type: INPUT_KEYBOARD,
            Anonymous: INPUT_0 {
                ki: KEYBDINPUT {
                    wVk: VIRTUAL_KEY(VK_CONTROL.0),
                    wScan: 0,
                    dwFlags: KEYBD_EVENT_FLAGS(0),
                    time: 0,
                    dwExtraInfo: 0,
                },
            },
        };
        let v_down = INPUT {
            r#type: INPUT_KEYBOARD,
            Anonymous: INPUT_0 {
                ki: KEYBDINPUT {
                    wVk: VIRTUAL_KEY(0x56),
                    wScan: 0,
                    dwFlags: KEYBD_EVENT_FLAGS(0),
                    time: 0,
                    dwExtraInfo: 0,
                },
            },
        };
        let v_up = INPUT {
            r#type: INPUT_KEYBOARD,
            Anonymous: INPUT_0 {
                ki: KEYBDINPUT {
                    wVk: VIRTUAL_KEY(0x56),
                    wScan: 0,
                    dwFlags: KEYEVENTF_KEYUP,
                    time: 0,
                    dwExtraInfo: 0,
                },
            },
        };
        let ctrl_up = INPUT {
            r#type: INPUT_KEYBOARD,
            Anonymous: INPUT_0 {
                ki: KEYBDINPUT {
                    wVk: VIRTUAL_KEY(VK_CONTROL.0),
                    wScan: 0,
                    dwFlags: KEYEVENTF_KEYUP,
                    time: 0,
                    dwExtraInfo: 0,
                },
            },
        };

        let sent = SendInput(
            &[ctrl_down, v_down, v_up, ctrl_up],
            std::mem::size_of::<INPUT>() as i32,
        );
        sent == 4
    }
}

fn handle_paste(text: &str, request_id: Option<u64>) -> serde_json::Value {
    let ok = if text.is_empty() {
        true
    } else {
        send_input_unicode(text)
    };

    json!({
        "event": "pasted",
        "requestId": request_id,
        "ok": ok,
        "fallback": false,
    })
}

fn main() {
    let stdin = io::stdin();
    for line in stdin.lock().lines().flatten() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        let cmd: Command = match serde_json::from_str(trimmed) {
            Ok(c) => c,
            Err(_) => continue,
        };
        let response = match cmd.action.as_str() {
            "paste" => handle_paste(&cmd.text, cmd.requestId),
            _ => json!({"error":"unknown-action","requestId":cmd.requestId}),
        };
        emit(response);
    }
}
