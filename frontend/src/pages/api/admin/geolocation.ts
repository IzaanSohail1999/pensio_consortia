import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../_db/mongoConnect';
import AdminSettingsManager from '../_db/adminSettings';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Connect to database
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        // Get current geolocation settings
        const settings = await AdminSettingsManager.getGeolocationSettings();
        
        if (!settings) {
          // Initialize default settings if none exist
          const success = await AdminSettingsManager.initializeDefaultSettings('admin');
          if (success) {
            const newSettings = await AdminSettingsManager.getGeolocationSettings();
            return res.status(200).json({
              success: true,
              data: newSettings
            });
          }
        }

        return res.status(200).json({
          success: true,
          data: settings
        });
      } catch (error) {
        console.error('[GEOLOCATION API] Error getting settings:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to get geolocation settings'
        });
      }
      break;

    case 'POST':
      try {
        const { isEnabled, restrictedCountries, adminUsername } = req.body;

        if (typeof isEnabled !== 'boolean' || !Array.isArray(restrictedCountries) || !adminUsername) {
          return res.status(400).json({
            success: false,
            message: 'Invalid request data. Required: isEnabled (boolean), restrictedCountries (array), adminUsername (string)'
          });
        }

        // Update geolocation settings
        const success = await AdminSettingsManager.updateGeolocationSettings({
          isEnabled,
          restrictedCountries
        }, adminUsername);

        if (success) {
          // Get updated settings
          const updatedSettings = await AdminSettingsManager.getGeolocationSettings();
          return res.status(200).json({
            success: true,
            message: 'Geolocation settings updated successfully',
            data: updatedSettings
          });
        } else {
          return res.status(500).json({
            success: false,
            message: 'Failed to update geolocation settings'
          });
        }
      } catch (error) {
        console.error('[GEOLOCATION API] Error updating settings:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to update geolocation settings'
        });
      }
      break;

    case 'PUT':
      try {
        const { action, countryCode, adminUsername } = req.body;

        if (!action || !adminUsername) {
          return res.status(400).json({
            success: false,
            message: 'Invalid request data. Required: action, adminUsername'
          });
        }

        let success = false;

        switch (action) {
          case 'addCountry':
            if (!countryCode) {
              return res.status(400).json({
                success: false,
                message: 'Country code is required for addCountry action'
              });
            }
            success = await AdminSettingsManager.addRestrictedCountry(countryCode, adminUsername);
            break;

          case 'removeCountry':
            if (!countryCode) {
              return res.status(400).json({
                success: false,
                message: 'Country code is required for removeCountry action'
              });
            }
            success = await AdminSettingsManager.removeRestrictedCountry(countryCode, adminUsername);
            break;

          case 'toggle':
            const currentSettings = await AdminSettingsManager.getGeolocationSettings();
            if (currentSettings) {
              success = await AdminSettingsManager.toggleGeolocation(!currentSettings.isEnabled, adminUsername);
            }
            break;

          default:
            return res.status(400).json({
              success: false,
              message: 'Invalid action. Supported actions: addCountry, removeCountry, toggle'
            });
        }

        if (success) {
          // Get updated settings
          const updatedSettings = await AdminSettingsManager.getGeolocationSettings();
          return res.status(200).json({
            success: true,
            message: 'Action completed successfully',
            data: updatedSettings
          });
        } else {
          return res.status(500).json({
            success: false,
            message: 'Failed to complete action'
          });
        }
      } catch (error) {
        console.error('[GEOLOCATION API] Error with action:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to complete action'
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
