import fs from "fs";
import path from "path";
import { Request, Response } from "express";

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir, { recursive: true });
}

// Create log file streams
const accessLogStream = fs.createWriteStream(
	path.join(logsDir, "access.log"),
	{ flags: "a" }
);

const errorLogStream = fs.createWriteStream(
	path.join(logsDir, "error.log"),
	{ flags: "a" }
);

/**
 * Format date to YYYY-MM-DD HH:mm:ss
 */
const formatTimestamp = (): string => {
	return new Date().toISOString().replace("T", " ").substring(0, 19);
};

/**
 * Log API access information
 */
export const logAccess = (req: Request, res: Response, duration: number): void => {
	const timestamp = formatTimestamp();
	const statusCode = res.statusCode;
	
	const logEntry = `[${timestamp}] ${req.method} ${req.originalUrl} ${statusCode} ${duration}ms`;
	
	console.log(logEntry.trim());
	accessLogStream.write(logEntry);
};

/**
 * Log error information
 */
export const logError = (error: any, req?: Request): void => {
	const timestamp = formatTimestamp();
	let errorMessage = error instanceof Error ? error.stack : String(error);
	
	if (req) {
		const ip = req.ip || req.connection.remoteAddress || "Unknown";
		errorMessage = `[${timestamp}] ERROR - IP: ${ip} - URL: ${req.originalUrl} - ${errorMessage}\n`;
	} else {
		errorMessage = `[${timestamp}] ERROR - ${errorMessage}\n`;
	}
	
	console.error(errorMessage.trim());
	errorLogStream.write(errorMessage);
};

/**
 * Close log streams gracefully
 */
export const closeLogStreams = (): void => {
	accessLogStream.end();
	errorLogStream.end();
};

export default {
	logAccess,
	logError,
	closeLogStreams
};