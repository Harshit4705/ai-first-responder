import { db } from "./index";
import { medicalFacilities } from "@shared/schema";

async function seed() {
  try {
    console.log("Starting database seed...");

    // Seed medical facilities
    const existingFacilities = await db.query.medicalFacilities.findMany();
    
    if (existingFacilities.length === 0) {
      console.log("Seeding medical facilities...");
      await db.insert(medicalFacilities).values([
        {
          name: "City General Hospital",
          address: "123 Medical Center Dr, Anytown, USA",
          latitude: 37.7749,
          longitude: -122.4194,
          phone: "+1-555-123-4567",
          openHours: "Open 24/7",
          facilityType: "Hospital",
          emergencyServices: true
        },
        {
          name: "Urgent Care Clinic",
          address: "456 Health St, Anytown, USA",
          latitude: 37.7833,
          longitude: -122.4167,
          phone: "+1-555-987-6543",
          openHours: "9:00 AM - 8:00 PM",
          facilityType: "Urgent Care",
          emergencyServices: false
        },
        {
          name: "Community Medical Center",
          address: "789 Wellness Blvd, Anytown, USA",
          latitude: 37.7695,
          longitude: -122.4240,
          phone: "+1-555-456-7890",
          openHours: "Open 24/7",
          facilityType: "Hospital",
          emergencyServices: true
        },
        {
          name: "Family Health Clinic",
          address: "321 Care Lane, Anytown, USA",
          latitude: 37.7825,
          longitude: -122.4382,
          phone: "+1-555-345-6789",
          openHours: "8:00 AM - 6:00 PM",
          facilityType: "Clinic",
          emergencyServices: false
        },
        {
          name: "Emergency Medical Center",
          address: "555 Rescue Road, Anytown, USA",
          latitude: 37.7935,
          longitude: -122.4217,
          phone: "+1-555-911-0123",
          openHours: "Open 24/7",
          facilityType: "Emergency Center",
          emergencyServices: true
        }
      ]);
      console.log("Medical facilities seeded successfully!");
    } else {
      console.log(`Found ${existingFacilities.length} existing medical facilities. Skipping seed.`);
    }

    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
