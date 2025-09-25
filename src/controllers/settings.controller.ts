import { Response } from "express";
import Settings from "../models/Settings";
import { 
  ApiResponse, 
} from "../types";
import { AuthRequest } from "../middleware/auth";
import { CreateSettingsRequest, SettingsInterface, UpdateSettingsRequest } from "../types/settings";

export const createSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      const response: ApiResponse = {
        status: false,
        message: "User not authenticated",
        data: null,
      };
      return res.status(401).json(response);
    }

    const existingSettings = await Settings.findOne({ userId });
    if (existingSettings) {
      const response: ApiResponse = {
        status: false,
        message: "Settings already exist for this user",
        data: null,
      };
      return res.status(400).json(response);
    }

    const settingsData = req.body as CreateSettingsRequest;
    
    const newSettings = new Settings({
      userId,
      ...settingsData,
    });

    const savedSettings = await newSettings.save();

    const response: ApiResponse<SettingsInterface> = {
      status: true,
      message: "Settings created successfully",
      data: savedSettings,
    };

    res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      status: false,
      message: error.message || "Error creating settings",
      data: null,
    };
    res.status(500).json(response);
  }
};

export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      const response: ApiResponse = {
        status: false,
        message: "User not authenticated",
        data: null,
      };
      return res.status(401).json(response);
    }

    const settings = await Settings.findOne({ userId });
    
    if (!settings) {
      const response: ApiResponse = {
        status: false,
        message: "Settings not found",
        data: null,
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<SettingsInterface> = {
      status: true,
      message: "Settings retrieved successfully",
      data: settings,
    };

    res.json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      status: false,
      message: error.message || "Error retrieving settings",
      data: null,
    };
    res.status(500).json(response);
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      const response: ApiResponse = {
        status: false,
        message: "User not authenticated",
        data: null,
      };
      return res.status(401).json(response);
    }

    const updateData = req.body as UpdateSettingsRequest;
    
    const updatedSettings = await Settings.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedSettings) {
      const response: ApiResponse = {
        status: false,
        message: "Settings not found",
        data: null,
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<SettingsInterface> = {
      status: true,
      message: "Settings updated successfully",
      data: updatedSettings,
    };

    res.json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      status: false,
      message: error.message || "Error updating settings",
      data: null,
    };
    res.status(500).json(response);
  }
};

export const deleteSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      const response: ApiResponse = {
        status: false,
        message: "User not authenticated",
        data: null,
      };
      return res.status(401).json(response);
    }

    const deletedSettings = await Settings.findOneAndDelete({ userId });

    if (!deletedSettings) {
      const response: ApiResponse = {
        status: false,
        message: "Settings not found",
        data: null,
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      status: true,
      message: "Settings deleted successfully",
      data: null,
    };

    res.json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      status: false,
      message: error.message || "Error deleting settings",
      data: null,
    };
    res.status(500).json(response);
  }
};