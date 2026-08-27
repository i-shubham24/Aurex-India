import apiClient from "./apiClient";

export interface ShiprocketTrackingActivity {
  date: string;
  status: string;
  activity: string;
  location: string;
  'sr-status': string;
}

export interface ShiprocketTrackResponse {
  tracking_data?: {
    track_status: number;
    shipment_status: number;
    shipment_track?: Array<{
      id: number;
      awb_code: string;
      courier_name: string;
      pickup_date: string;
      delivered_date?: string;
      weight: string;
      packages: number;
      current_status: string;
    }>;
    shipment_track_activities?: ShiprocketTrackingActivity[];
    track_url?: string;
  };
}

export const shippingApi = {
  trackByAwb: async (awb: string): Promise<any> => {
    const res = await apiClient.get(`/shipping/track/${awb}`);
    return res.data?.data;
  },

  checkServiceability: async (deliveryPincode: string, pickupPincode = "143001"): Promise<any> => {
    const res = await apiClient.get(`/shipping/serviceability`, {
      params: {
        pickup_postcode: pickupPincode,
        delivery_postcode: deliveryPincode,
        weight: 1,
        cod: 0,
      },
    });
    return res.data?.data;
  },
};
