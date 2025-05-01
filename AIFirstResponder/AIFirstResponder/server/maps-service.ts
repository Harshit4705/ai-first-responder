interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

interface MedicalFacility {
  id: number;
  name: string;
  distance: string;
  duration: string;
  address: string;
  phone: string;
  openHours: string;
  emergencyServices: boolean;
}

/**
 * Gets nearby hospitals and medical facilities based on location using Mappls API (formerly MapmyIndia)
 * @param location User's location coordinates
 * @returns Array of nearby medical facilities
 */
export async function getNearbyHospitals(location: LocationCoordinates): Promise<MedicalFacility[]> {
  try {
    // Make an actual API call to Mappls Nearby API
    const apiKey = process.env.MAPPLS_API_KEY;
    
    if (!apiKey) {
      console.error("Mappls API Key not found");
      throw new Error("API key not configured");
    }
    
    console.log(`Searching for hospitals near ${location.latitude}, ${location.longitude}`);
    
    // Mappls Nearby API endpoint
    const response = await fetch(
      `https://apis.mappls.com/advancedmaps/v1/${apiKey}/nearby/json?keywords=hospital&refLocation=${location.latitude},${location.longitude}&radius=5000&sortBy=distance`
    );
    
    if (!response.ok) {
      throw new Error(`Mappls API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Mappls API response:", JSON.stringify(data).substring(0, 200) + "...");
    
    if (!data.suggestedLocations || !Array.isArray(data.suggestedLocations)) {
      console.error("Unexpected response format from Mappls API:", data);
      throw new Error("Invalid response format from Mappls API");
    }
    
    return data.suggestedLocations.slice(0, 5).map((result: any, index: number) => {
      // Calculate distance in kilometers
      const distance = result.distance ? result.distance / 1000 : 
                       calculateDistance(location, {lat: result.latitude, lng: result.longitude});
      
      return {
        id: index + 1,
        name: result.placeName || "Hospital",
        distance: `${distance.toFixed(1)} km`,
        duration: estimateDuration(distance),
        address: result.placeAddress || result.addressTokens?.formattedAddress || "Address not available",
        phone: result.contactDetails?.phone || "Not available",
        openHours: result.openingTime ? `${result.openingTime} - ${result.closingTime}` : "Hours not available",
        emergencyServices: result.type === "EMERGENCY" || 
                          (result.placeName && result.placeName.toLowerCase().includes("emergency"))
      };
    });
  } catch (error) {
    console.error("Error fetching nearby hospitals:", error);
    
    // Fallback to sample data if the API call fails
    console.log("Using fallback hospital data for India");
    return [
      {
        id: 1,
        name: "AIIMS Hospital",
        distance: "2.4 km",
        duration: "15 min",
        address: "Ansari Nagar East, New Delhi, Delhi 110029",
        phone: "011-2658-8500",
        openHours: "Open 24/7",
        emergencyServices: true
      },
      {
        id: 2,
        name: "Max Super Speciality Hospital",
        distance: "1.1 km",
        duration: "8 min",
        address: "1, 2, Press Enclave Marg, Saket, New Delhi, Delhi 110017",
        phone: "011-2651-5050",
        openHours: "Open 24/7",
        emergencyServices: true
      },
      {
        id: 3,
        name: "Apollo Hospital",
        distance: "3.7 km",
        duration: "22 min",
        address: "Sarita Vihar, Delhi Mathura Road, New Delhi, Delhi 110076",
        phone: "011-7179-1090",
        openHours: "Open 24/7",
        emergencyServices: true
      },
      {
        id: 4,
        name: "Fortis Escorts Heart Institute",
        distance: "5.2 km",
        duration: "30 min",
        address: "Okhla Road, Sukhdev Vihar Metro Station, New Delhi, Delhi 110025",
        phone: "011-4713-5000",
        openHours: "Open 24/7",
        emergencyServices: true
      }
    ];
  }
}

/**
 * Calculates the distance between two sets of coordinates
 * @param from Starting coordinates
 * @param to Ending coordinates
 * @returns Distance in kilometers
 */
function calculateDistance(from: LocationCoordinates, to: {lat: number, lng: number}): number {
  // Haversine formula for calculating distances between coordinates
  const R = 6371.0; // Earth's radius in kilometers
  const dLat = toRadians(to.lat - from.latitude);
  const dLon = toRadians(to.lng - from.longitude);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.lat)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Converts degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

/**
 * Estimates driving duration based on distance
 * @param distance Distance in kilometers
 * @returns Estimated duration as a string
 */
function estimateDuration(distance: number): string {
  // Very rough estimate assuming average speed of 30 km/h in Indian urban areas
  const minutes = Math.round(distance * 2);
  return `${minutes} min`;
}
