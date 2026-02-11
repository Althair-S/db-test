import dns from "dns";
import net from "net";

const HOSTNAME = "_mongodb._tcp.cluster0.5nngnt1.mongodb.net";

console.log("🔍 Starting DNS Diagnostics...");

// 1. Check System DNS Servers
console.log("📋 System DNS Servers:", dns.getServers());

// 2. Resolve SRV Record
console.log(`\nTesting SRV resolution for: ${HOSTNAME}`);
dns.resolveSrv(HOSTNAME, (err, addresses) => {
  if (err) {
    console.error("❌ SRV Resolution Failed:", err.code, err.message);
    console.log(
      "\n💡 Analysis: Your system cannot resolve the MongoDB Atlas SRV record.",
    );
    console.log(
      "   This is likely due to your ISP or strict network firewall blocking DNS queries.",
    );
    console.log("   RECOMMENDED FIX: Use Google DNS (8.8.8.8) in the code.");
  } else {
    console.log("✅ SRV Resolution Successful:", addresses);

    if (addresses && addresses.length > 0) {
      const target = addresses[0];
      console.log(
        `\nTesting TCP Connection to ${target.name}:${target.port}...`,
      );

      const socket = new net.Socket();
      socket.setTimeout(5000);

      socket.connect(target.port, target.name, () => {
        console.log("✅ TCP Connection Successful!");
        socket.destroy();
      });

      socket.on("error", (err) => {
        console.error("❌ TCP Connection Failed:", err.message);
      });

      socket.on("timeout", () => {
        console.error("❌ TCP Connection Timed Out");
        socket.destroy();
      });
    }
  }
});
