import nodemailer from "nodemailer";
import { BookingInterface } from "../types/booking";
import { getOAuth2Token, generateRefreshToken } from "./oauth2.helper";

// Store refresh token in memory (in a real application, you might want to store this more securely)
let cachedRefreshToken: string | null = null;

// Function to get or generate refresh token
const getRefreshToken = async (): Promise<string> => {
	// First check if we have a refresh token in environment variables
	if (process.env.GOOGLE_REFRESH_TOKEN) {
		return process.env.GOOGLE_REFRESH_TOKEN;
	}

	// If we have a cached refresh token, use it
	if (cachedRefreshToken) {
		return cachedRefreshToken;
	}

	// Check if we have the required OAuth2 credentials
	if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
		throw new Error(
			"Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment variables. Cannot generate refresh token."
		);
	}

	// Otherwise, we need to generate a new refresh token
	cachedRefreshToken = await generateRefreshToken();
	return cachedRefreshToken;
};

// Create transporter using SMTP details from environment variables
// Supports both traditional SMTP and OAuth2 authentication
const createTransporter = async () => {
	// Check if OAuth2 credentials are provided
	const useOAuth2 =
		process.env.GOOGLE_CLIENT_ID &&
		process.env.GOOGLE_CLIENT_SECRET &&
		process.env.GOOGLE_REFRESH_TOKEN;

	if (useOAuth2) {
		try {
			// Get refresh token (generate if needed)
			const refreshToken = await getRefreshToken();

			// Get OAuth2 token
			const oauth2Tokens = await getOAuth2Token(refreshToken);

			// OAuth2 configuration
			const transporter = nodemailer.createTransport({
				host: process.env.SMTP_HOST || "smtp.gmail.com",
				port: parseInt(process.env.SMTP_PORT || "465"),
				secure: process.env.SMTP_SECURE === "true",
				auth: {
					type: "OAuth2",
					user: process.env.SMTP_USER,
					clientId: process.env.GOOGLE_CLIENT_ID,
					clientSecret: process.env.GOOGLE_CLIENT_SECRET,
					refreshToken: refreshToken,
					accessToken: oauth2Tokens.accessToken,
					expires: oauth2Tokens.expires
				}
			});

			// Listen for token updates (optional)
			transporter.on("token", (token) => {
				// Token refresh events are handled automatically by nodemailer
			});

			return transporter;
		} catch (error) {
			console.error("Failed to create OAuth2 transporter:", error);
			throw error;
		}
	} else {
		// Traditional SMTP configuration
		const transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST || "smtp.gmail.com",
			port: parseInt(process.env.SMTP_PORT || "587"),
			secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS
			}
		});

		return transporter;
	}
};

// Send booking confirmation email to the user
export const sendBookingConfirmationEmail = async (
	booking: BookingInterface & { email?: string }
) => {
	try {
		const transporter = await createTransporter();

		const mailOptions = {
			from: process.env.SMTP_FROM || process.env.SMTP_USER,
			to: booking.email, // Assuming we add email field to booking
			subject: "Booking Confirmation - Travel Service",
			html: `
        <h1>Booking Confirmation</h1>
        <p>Dear ${booking.name},</p>
        <p>Your booking has been successfully created. Here are the details:</p>
        <ul>
          <li><strong>Name:</strong> ${booking.name}</li>
          <li><strong>Phone:</strong> ${booking.phoneNumber}</li>
          <li><strong>Date:</strong> ${new Date(
						booking.date
					).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${booking.time}</li>
          <li><strong>Pickup Location:</strong> ${booking.pickup}</li>
          <li><strong>Drop Location:</strong> ${booking.drop}</li>
          <li><strong>Vehicle Type:</strong> ${booking.vehicle}</li>
          <li><strong>Description:</strong> ${booking.description || "N/A"}</li>
        </ul>
        <p>Thank you for choosing our service!</p>
      `
		};

		const info = await transporter.sendMail(mailOptions);
		return { success: true, messageId: info.messageId };
	} catch (error: any) {
		console.error("Error sending booking confirmation email:", error);
		return { success: false, error: error.message };
	}
};

// Send notification email to admin
export const sendBookingNotificationEmail = async (
	booking: BookingInterface & { email?: string }
) => {
	try {
		const transporter = await createTransporter();

		const mailOptions = {
			from: process.env.SMTP_FROM || process.env.SMTP_USER,
			to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
			subject: "New Booking Created - Travel Service",
			html: `
        <h1>New Booking Notification</h1>
        <p>A new booking has been created. Here are the details:</p>
        <ul>
          <li><strong>Name:</strong> ${booking.name}</li>
          <li><strong>Email:</strong> ${booking.email || "N/A"}</li>
          <li><strong>Phone:</strong> ${booking.phoneNumber}</li>
          <li><strong>Date:</strong> ${new Date(
						booking.date
					).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${booking.time}</li>
          <li><strong>Pickup Location:</strong> ${booking.pickup}</li>
          <li><strong>Drop Location:</strong> ${booking.drop}</li>
          <li><strong>Vehicle Type:</strong> ${booking.vehicle}</li>
          <li><strong>Description:</strong> ${booking.description || "N/A"}</li>
        </ul>
      `
		};

		const info = await transporter.sendMail(mailOptions);
		return { success: true, messageId: info.messageId };
	} catch (error: any) {
		console.error("Error sending booking notification email:", error);
		return { success: false, error: error.message };
	}
};
