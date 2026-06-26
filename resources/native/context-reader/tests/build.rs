use std::path::Path;

fn test_cargo_toml() {
    assert!(Path::new("Cargo.toml").exists());
}
