import React, { useState, useEffect } from "react";
import { MapPin, Phone, RefreshCw, Map } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Facility {
  id: number;
  name: string;
  distance: string;
  duration: string;
  address: string;
  phone: string;
  openHours: string;
  emergencyServices: boolean;
}

interface NearbyFacilitiesProps {
  facilities: Facility[];
}

const NearbyFacilities: React.FC<NearbyFacilitiesProps> = ({ facilities: propFacilities }) => {
  const [facilities, setFacilities] = useState<Facility[]>(propFacilities);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>("Loading location...");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    getUserLocation();
  }, []);

  // Update facilities whenever prop facilities change
  useEffect(() => {
    setFacilities(propFacilities);
  }, [propFacilities]);

  // Fetch nearby hospitals when user location is updated
  useEffect(() => {
    if (userLocation) {
      fetchNearbyHospitals();
    }
  }, [userLocation]);

  const fetchNearbyHospitals = async () => {
    if (!userLocation) return;
    
    try {
      setLocationStatus("Finding nearby facilities...");
      
      const response = await fetch('/api/nearby-hospitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          latitude: userLocation.lat,
          longitude: userLocation.lng
        })
      });
      
      const data = await response.json();
      
      if (data.facilities && Array.isArray(data.facilities)) {
        setFacilities(data.facilities);
        setLocationStatus(`Found ${data.facilities.length} medical facilities nearby`);
      } else {
        console.error("Invalid response format:", data);
        setLocationStatus("Found your location");
      }
    } catch (error) {
      console.error("Error fetching nearby hospitals:", error);
      setLocationStatus("Found location, but could not fetch nearby facilities");
    }
  };

  const getUserLocation = () => {
    setIsRefreshing(true);
    setLocationStatus("Updating your location...");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationStatus("Location found");
          setIsRefreshing(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationStatus("Could not detect location");
          setIsRefreshing(false);
          toast({
            title: "Location Error",
            description: "Could not detect your location. Please check your browser settings and try again.",
            variant: "destructive"
          });
        }
      );
    } else {
      setLocationStatus("Geolocation is not supported by this browser");
      setIsRefreshing(false);
      toast({
        title: "Location Not Supported",
        description: "Your browser does not support geolocation services, which are needed to find nearby facilities.",
        variant: "destructive"
      });
    }
  };

  const openDirections = (facility: Facility) => {
    if (!userLocation) return;
    
    // Use Mappls Directions API (for India)
    const url = `https://maps.mappls.com/direction?from=${userLocation.lat},${userLocation.lng}&to=${encodeURIComponent(facility.address)}&by=car`;
    window.open(url, '_blank');
  };

  const callFacility = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <>
      <h3 className="text-lg font-semibold mb-4">Nearby Medical Facilities</h3>
      
      <div className="bg-muted rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-primary mr-2" />
            <span className="text-sm font-medium">Your current location</span>
          </div>
          <button 
            onClick={getUserLocation} 
            disabled={isRefreshing}
            className="text-secondary hover:text-secondary/80 text-sm flex items-center disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        <div className="text-sm text-muted-foreground">
          {locationStatus}
        </div>
      </div>
      
      <div className="h-64 bg-muted rounded-lg mb-4 overflow-hidden relative">
        {userLocation ? (
          <iframe
            title="Map"
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://maps.mappls.com/explore/nearby/hospital/@${userLocation.lat},${userLocation.lng},13z`}
            allowFullScreen
          ></iframe>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <span>Map loading... Please allow location access</span>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {facilities.map((facility) => (
          <div 
            key={facility.id}
            className="bg-card border border-border rounded-md p-3 hover:bg-muted/50 transition cursor-pointer"
          >
            <div className="flex justify-between">
              <div>
                <h4 className="font-medium text-foreground">{facility.name}</h4>
                <p className="text-sm text-muted-foreground mb-1">
                  {facility.distance} away • {facility.duration} drive
                </p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className={`px-2 py-0.5 rounded-full mr-2 ${
                    facility.openHours.includes("24/7") || facility.openHours.includes("Open")
                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                      : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                  }`}>
                    {facility.openHours}
                  </span>
                  <span>
                    {facility.emergencyServices ? "Emergency Services Available" : "Non-Emergency Facility"}
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <button 
                  onClick={() => callFacility(facility.phone)}
                  className="text-secondary p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
                  aria-label="Call facility"
                >
                  <Phone className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => openDirections(facility)}
                  className="text-secondary p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
                  aria-label="Get directions"
                >
                  <Map className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {facilities.length === 0 && (
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              No medical facilities found nearby.
              {!userLocation && " Please enable location services."}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default NearbyFacilities;
