import process from "process";

/**
 * Memory cleanup utility to help prevent memory leaks
 */

// Store intervals so they can be cleared if needed
const intervals: NodeJS.Timeout[] = [];

/**
 * Force garbage collection if available (requires --expose-gc flag)
 */
export const forceGarbageCollection = () => {
	if (global.gc) {
		global.gc();
		console.log("Garbage collection triggered");
	}
};

/**
 * Monitor memory usage and log warnings when thresholds are exceeded
 */
export const monitorMemoryUsage = () => {
	const usage = process.memoryUsage();
	const heapUsedMB = Math.round((usage.heapUsed / 1024 / 1024) * 100) / 100;
	const heapTotalMB = Math.round((usage.heapTotal / 1024 / 1024) * 100) / 100;

	// Log memory usage
	console.log(
		`Memory Usage - Heap Used: ${heapUsedMB} MB, Heap Total: ${heapTotalMB} MB`
	);

	// Warning if heap usage exceeds 70% of total heap
	if (heapUsedMB / heapTotalMB > 0.7) {
		console.warn(
			`High memory usage detected: ${heapUsedMB} MB / ${heapTotalMB} MB`
		);
	}

	// Critical warning if heap usage exceeds 90% of total heap
	if (heapUsedMB / heapTotalMB > 0.9) {
		console.error(
			`Critical memory usage: ${heapUsedMB} MB / ${heapTotalMB} MB`
		);
		// Force garbage collection if available
		forceGarbageCollection();
	}
};

/**
 * Start periodic memory monitoring
 * @param interval Interval in milliseconds (default: 30 seconds)
 */
export const startMemoryMonitoring = (interval: number = 30000) => {
	const intervalId = setInterval(() => {
		monitorMemoryUsage();
	}, interval);

	intervals.push(intervalId);

	// Also monitor on process events
	process.on("warning", (warning) => {
		if (warning.name === "MaxListenersExceededWarning") {
			console.warn("Potential memory leak: Max listeners exceeded");
			monitorMemoryUsage();
		}
	});

	return intervalId;
};

/**
 * Stop memory monitoring
 */
export const stopMemoryMonitoring = () => {
	intervals.forEach((interval) => clearInterval(interval));
	intervals.length = 0; // Clear the array
};

/**
 * Cleanup function to be called when the application is shutting down
 */
export const cleanup = () => {
	stopMemoryMonitoring();
	console.log("Memory monitoring stopped");
};

// Handle process termination signals
process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);
process.on("beforeExit", cleanup);

export default {
	forceGarbageCollection,
	monitorMemoryUsage,
	startMemoryMonitoring,
	stopMemoryMonitoring,
	cleanup
};
