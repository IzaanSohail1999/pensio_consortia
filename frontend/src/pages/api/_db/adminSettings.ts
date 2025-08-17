import mongoose from 'mongoose';

// Interface for geolocation settings
export interface IGeolocationSettings {
  isEnabled: boolean;
  restrictedCountries: string[];
  lastModified: Date;
  modifiedBy: string;
}

// Interface for admin settings document
export interface IAdminSettings {
  _id: string;
  geolocation: IGeolocationSettings;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema for admin settings
const adminSettingsSchema = new mongoose.Schema<IAdminSettings>({
  geolocation: {
    isEnabled: {
      type: Boolean,
      default: false
    },
    restrictedCountries: [{
      type: String,
      trim: true
    }],
    lastModified: {
      type: Date,
      default: Date.now
    },
    modifiedBy: {
      type: String,
      required: true
    }
  }
}, {
  timestamps: true,
  collection: 'adminSettings'
});

// Create the model
export const AdminSettings = mongoose.models.AdminSettings || mongoose.model<IAdminSettings>('AdminSettings', adminSettingsSchema);

// Utility functions for managing admin settings
export class AdminSettingsManager {
  /**
   * Get current admin settings
   */
  static async getSettings(): Promise<IAdminSettings | null> {
    try {
      const settings = await AdminSettings.findOne({});
      return settings;
    } catch (error) {
      console.error('[ADMIN SETTINGS] Error getting settings:', error);
      return null;
    }
  }

  /**
   * Get current geolocation settings
   */
  static async getGeolocationSettings(): Promise<IGeolocationSettings | null> {
    try {
      const settings = await AdminSettings.findOne({});
      return settings?.geolocation || null;
    } catch (error) {
      console.error('[ADMIN SETTINGS] Error getting geolocation settings:', error);
      return null;
    }
  }

  /**
   * Update geolocation settings
   */
  static async updateGeolocationSettings(
    updates: Partial<IGeolocationSettings>,
    modifiedBy: string
  ): Promise<boolean> {
    try {
      const result = await AdminSettings.findOneAndUpdate(
        {}, // Find first document
        {
          $set: {
            'geolocation.isEnabled': updates.isEnabled,
            'geolocation.restrictedCountries': updates.restrictedCountries || [],
            'geolocation.lastModified': new Date(),
            'geolocation.modifiedBy': modifiedBy
          }
        },
        {
          upsert: true, // Create if doesn't exist
          new: true,
          setDefaultsOnInsert: true
        }
      );

      return !!result;
    } catch (error) {
      console.error('[ADMIN SETTINGS] Error updating geolocation settings:', error);
      return false;
    }
  }

  /**
   * Initialize default admin settings if none exist
   */
  static async initializeDefaultSettings(adminUsername: string): Promise<boolean> {
    try {
      const existingSettings = await AdminSettings.findOne({});
      
      if (!existingSettings) {
        const defaultSettings = new AdminSettings({
          geolocation: {
            isEnabled: false,
            restrictedCountries: [],
            lastModified: new Date(),
            modifiedBy: adminUsername
          }
        });

        await defaultSettings.save();
        console.log('[ADMIN SETTINGS] Default settings initialized');
        return true;
      }

      return true;
    } catch (error) {
      console.error('[ADMIN SETTINGS] Error initializing default settings:', error);
      return false;
    }
  }

  /**
   * Add a country to restricted list
   */
  static async addRestrictedCountry(countryCode: string, modifiedBy: string): Promise<boolean> {
    try {
      const result = await AdminSettings.findOneAndUpdate(
        {},
        {
          $addToSet: { 'geolocation.restrictedCountries': countryCode },
          $set: {
            'geolocation.lastModified': new Date(),
            'geolocation.modifiedBy': modifiedBy
          }
        },
        { new: true }
      );

      return !!result;
    } catch (error) {
      console.error('[ADMIN SETTINGS] Error adding restricted country:', error);
      return false;
    }
  }

  /**
   * Remove a country from restricted list
   */
  static async removeRestrictedCountry(countryCode: string, modifiedBy: string): Promise<boolean> {
    try {
      const result = await AdminSettings.findOneAndUpdate(
        {},
        {
          $pull: { 'geolocation.restrictedCountries': countryCode },
          $set: {
            'geolocation.lastModified': new Date(),
            'geolocation.modifiedBy': modifiedBy
          }
        },
        { new: true }
      );

      return !!result;
    } catch (error) {
      console.error('[ADMIN SETTINGS] Error removing restricted country:', error);
      return false;
    }
  }

  /**
   * Toggle geolocation on/off
   */
  static async toggleGeolocation(isEnabled: boolean, modifiedBy: string): Promise<boolean> {
    try {
      const result = await AdminSettings.findOneAndUpdate(
        {},
        {
          $set: {
            'geolocation.isEnabled': isEnabled,
            'geolocation.lastModified': new Date(),
            'geolocation.modifiedBy': modifiedBy
          }
        },
        { new: true }
      );

      return !!result;
    } catch (error) {
      console.error('[ADMIN SETTINGS] Error toggling geolocation:', error);
      return false;
    }
  }
}

export default AdminSettingsManager;
