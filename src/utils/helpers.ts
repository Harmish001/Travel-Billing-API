import axios from "axios";

(async function healthCheck() {
	const HEALTH_URL = process.env.BACKENDURI + "/api/health"; // change to your actual route

	// define the function
	const checkHealth = async () => {
		try {
			const response = await axios.get(HEALTH_URL);
			console.log(
				`[${new Date().toISOString()}] Health check success:`,
				response.status
			);
		} catch (error) {
			console.error(`[${new Date().toISOString()}] Health check failed:`);
		}
	};

	// call immediately on startup
	await checkHealth();

	// schedule every 14 minutes
	const FOURTEEN_MINUTES = 14 * 60 * 1000;
	setInterval(checkHealth, FOURTEEN_MINUTES);
})();
