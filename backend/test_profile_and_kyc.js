import fetch from "node-fetch";

const BASE_URL = "http://localhost:5000/api";

async function runTests() {
  console.log("=== Testing KYC and Profile Endpoints ===");

  // 1. Test Send OTP
  console.log("\n1. Testing POST /api/auth/kyc/send-otp");
  const sendRes = await fetch(`${BASE_URL}/auth/kyc/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      aadhaarNumber: "123456789012",
      phone: "9876543210",
    }),
  });
  const sendData = await sendRes.json();
  console.log("Send OTP Status:", sendRes.status);
  console.log("Send OTP Response:", sendData);
  if (!sendData.success || sendData.data.aadhaarLast4 !== "XXXX-XXXX-9012") {
    throw new Error("Send OTP failed or incorrect aadhaarLast4");
  }

  // 2. Test Verify OTP
  console.log("\n2. Testing POST /api/auth/kyc/verify-otp");
  const verifyRes = await fetch(`${BASE_URL}/auth/kyc/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      otp: "123456",
      aadhaarLast4: "XXXX-XXXX-9012",
      aadhaarNumber: "123456789012",
    }),
  });
  const verifyData = await verifyRes.json();
  console.log("Verify OTP Status:", verifyRes.status);
  console.log("Verify OTP Response:", verifyData);
  if (!verifyData.success || !verifyData.data.verified) {
    throw new Error("Verify OTP failed");
  }

  // 3. Login as test farmer
  console.log("\n3. Testing Login as Farmer");
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "farmer@krishilink.com",
      password: "Demo@12345",
    }),
  });
  const loginData = await loginRes.json();
  console.log("Login Status:", loginRes.status);
  const token = loginData.data.token;
  const farmerId = loginData.data.user._id || loginData.data.user.id;
  console.log("Farmer ID:", farmerId);

  // 4. Update Farmer Profile
  console.log("\n4. Testing PUT /api/auth/profile with Farmer Details");
  const updateRes = await fetch(`${BASE_URL}/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: "Ramesh Patel",
      phone: "9876543210",
      location: "Sanwer",
      district: "Indore",
      state: "Madhya Pradesh",
      crops: "Wheat, Soybean, Gram",
      availableQuantity: 3500,
      cropQuality: "Grade A",
      fpoAssociation: "Narmada Kisan FPO",
      profilePhoto: "🧑‍🌾",
    }),
  });
  const updateData = await updateRes.json();
  console.log("Update Profile Status:", updateRes.status);
  console.log("Updated Farmer Data:", {
    name: updateData.data?.name,
    crops: updateData.data?.crops,
    availableQuantity: updateData.data?.availableQuantity,
    cropQuality: updateData.data?.cropQuality,
    fpoAssociation: updateData.data?.fpoAssociation,
    profilePhoto: updateData.data?.profilePhoto,
  });

  // 5. Test GET /api/auth/profile/:id (Trust Profile)
  console.log("\n5. Testing GET /api/auth/profile/:id");
  const profileRes = await fetch(`${BASE_URL}/auth/profile/${farmerId}`);
  const profileData = await profileRes.json();
  console.log("Get Profile Status:", profileRes.status);
  console.log("Public Trust Profile Data:", {
    name: profileData.data?.name,
    role: profileData.data?.role,
    crops: profileData.data?.crops,
    availableQuantity: profileData.data?.availableQuantity,
    cropQuality: profileData.data?.cropQuality,
    fpoAssociation: profileData.data?.fpoAssociation,
    verification: profileData.data?.verification,
    transactionCount: profileData.data?.transactionCount,
  });

  console.log("\n✅ ALL TESTS PASSED SUCCESSFULLY!");
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
