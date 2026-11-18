//! Error type returned by every command. It serialises to a plain, user-readable message.

use std::fmt;

#[derive(Debug)]
pub enum AppError {
    /// A file could not be read or written.
    Io {
        action: &'static str,
        detail: String,
    },
    /// Saved data was damaged or not valid JSON.
    Data(String),
    /// The caller passed something the app cannot accept.
    Invalid(String),
    /// An audio file could not be understood.
    Audio(String),
}

impl AppError {
    pub fn io(action: &'static str, err: std::io::Error) -> Self {
        AppError::Io {
            action,
            detail: err.to_string(),
        }
    }
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::Io { action, detail } => write!(f, "Could not {action}: {detail}"),
            AppError::Data(msg) => write!(f, "Saved data could not be read: {msg}"),
            AppError::Invalid(msg) => write!(f, "{msg}"),
            AppError::Audio(msg) => write!(f, "This audio file could not be decoded: {msg}"),
        }
    }
}

impl std::error::Error for AppError {}

impl serde::Serialize for AppError {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.serialize_str(&self.to_string())
    }
}

pub type AppResult<T> = Result<T, AppError>;
