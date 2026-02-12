import { RouterOSAPI } from 'node-routeros';

/**
 * Classe pour gérer l'API MikroTik RouterOS
 * Utilise l'API RouterOS native (port 8728/8729) pour gérer les utilisateurs Hotspot
 */
class MikrotikApi {
  constructor() {
    this.host = process.env.MIKROTIK_HOST || '192.168.88.1';
    this.port = parseInt(process.env.MIKROTIK_PORT) || 8728;
    this.username = process.env.MIKROTIK_USER || 'admin';
    this.password = process.env.MIKROTIK_PASSWORD || '';
    this.useSSL = process.env.MIKROTIK_SSL === 'true';
    this.timeout = parseInt(process.env.MIKROTIK_TIMEOUT) || 10000;
    this.connection = null;
  }

  /**
   * Établit une connexion à l'API RouterOS
   */
  async connect() {
    try {
      this.connection = new RouterOSAPI({
        host: this.host,
        port: this.port,
        user: this.username,
        password: this.password,
        timeout: this.timeout,
        tls: this.useSSL ? {} : undefined
      });

      await this.connection.connect();
      console.log(`✅ Connecté à MikroTik ${this.host}:${this.port}`);
      return true;
    } catch (error) {
      console.error(`❌ Connexion MikroTik échouée: ${error.message}`);
      this.connection = null;
      throw error;
    }
  }

  /**
   * Ferme la connexion
   */
  async disconnect() {
    if (this.connection) {
      try {
        await this.connection.close();
        this.connection = null;
        console.log('🔌 Déconnecté de MikroTik');
      } catch (error) {
        console.error(`Erreur déconnexion: ${error.message}`);
      }
    }
  }

  /**
   * Exécute une commande avec reconnexion automatique
   */
  async execute(command, params = {}) {
    try {
      if (!this.connection) {
        await this.connect();
      }

      const result = await this.connection.write(command, Object.entries(params).map(([k, v]) => `=${k}=${v}`));
      return result;
    } catch (error) {
      // Tenter une reconnexion si la connexion est perdue
      if (error.message.includes('closed') || error.message.includes('timeout')) {
        this.connection = null;
        await this.connect();
        return await this.connection.write(command, Object.entries(params).map(([k, v]) => `=${k}=${v}`));
      }
      throw error;
    }
  }

  /**
   * Ajoute un utilisateur Hotspot sur MikroTik
   * @param {string} code - Le code/login de l'utilisateur
   * @param {string} password - Le mot de passe (peut être le même que le code)
   * @param {string} profile - Le profil MikroTik (basé sur le forfait)
   * @param {number} limitUptime - Limite de temps en secondes (optionnel)
   * @param {number} limitBytesTotal - Limite de données en bytes (optionnel)
   */
  async addHotspotUser(code, password, profile = 'default', limitUptime = null, limitBytesTotal = null) {
    const params = {
      name: code,
      password: password || code,
      profile: profile,
      comment: `Generated: ${new Date().toISOString()}`
    };

    // Ajouter les limites si spécifiées
    if (limitUptime) {
      params['limit-uptime'] = this.formatTime(limitUptime);
    }
    if (limitBytesTotal) {
      params['limit-bytes-total'] = String(limitBytesTotal);
    }

    try {
      const result = await this.execute('/ip/hotspot/user/add', params);
      console.log(`✅ Utilisateur Hotspot créé sur MikroTik: ${code}`);
      return { success: true, data: result };
    } catch (error) {
      console.error(`❌ Erreur création utilisateur MikroTik: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Formate les secondes en format MikroTik (ex: 1h30m)
   */
  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    let result = '';
    if (hours > 0) result += `${hours}h`;
    if (minutes > 0) result += `${minutes}m`;
    if (secs > 0 || result === '') result += `${secs}s`;
    return result;
  }

  /**
   * Supprime un utilisateur Hotspot du MikroTik
   * @param {string} code - Le code/login de l'utilisateur à supprimer
   */
  async removeHotspotUser(code) {
    try {
      // Chercher l'utilisateur par son nom
      const users = await this.execute('/ip/hotspot/user/print', { '?name': code });
      
      if (users && users.length > 0) {
        const userId = users[0]['.id'];
        await this.execute('/ip/hotspot/user/remove', { '.id': userId });
        console.log(`✅ Utilisateur Hotspot supprimé de MikroTik: ${code}`);
        return { success: true };
      } else {
        console.log(`⚠️ Utilisateur non trouvé sur MikroTik: ${code}`);
        return { success: true, message: 'User not found' };
      }
    } catch (error) {
      console.error(`❌ Erreur suppression utilisateur MikroTik: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Désactive un utilisateur Hotspot (au lieu de le supprimer)
   * @param {string} code - Le code/login de l'utilisateur
   */
  async disableHotspotUser(code) {
    try {
      const users = await this.execute('/ip/hotspot/user/print', { '?name': code });
      
      if (users && users.length > 0) {
        const userId = users[0]['.id'];
        await this.execute('/ip/hotspot/user/set', { '.id': userId, disabled: 'yes' });
        console.log(`✅ Utilisateur Hotspot désactivé sur MikroTik: ${code}`);
        return { success: true };
      } else {
        return { success: true, message: 'User not found' };
      }
    } catch (error) {
      console.error(`❌ Erreur désactivation utilisateur MikroTik: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Vérifie si un utilisateur existe sur MikroTik
   * @param {string} code - Le code/login à vérifier
   */
  async checkHotspotUser(code) {
    try {
      const users = await this.execute('/ip/hotspot/user/print', { '?name': code });
      return { exists: users && users.length > 0, data: users?.[0] || null };
    } catch (error) {
      console.error(`❌ Erreur vérification utilisateur MikroTik: ${error.message}`);
      return { exists: false, error: error.message };
    }
  }

  /**
   * Récupère les statistiques d'un utilisateur actif
   * @param {string} code - Le code/login de l'utilisateur
   */
  async getHotspotUserStats(code) {
    try {
      const active = await this.execute('/ip/hotspot/active/print', { '?user': code });
      if (active && active.length > 0) {
        return {
          active: true,
          uptime: active[0].uptime,
          bytesIn: parseInt(active[0]['bytes-in']) || 0,
          bytesOut: parseInt(active[0]['bytes-out']) || 0,
          macAddress: active[0]['mac-address'],
          address: active[0].address
        };
      }
      return { active: false };
    } catch (error) {
      console.error(`❌ Erreur récupération stats MikroTik: ${error.message}`);
      return { active: false, error: error.message };
    }
  }

  /**
   * Liste tous les utilisateurs Hotspot
   */
  async listHotspotUsers() {
    try {
      return await this.execute('/ip/hotspot/user/print');
    } catch (error) {
      console.error(`❌ Erreur liste utilisateurs MikroTik: ${error.message}`);
      return [];
    }
  }

  /**
   * Liste les utilisateurs actifs du Hotspot
   */
  async listActiveUsers() {
    try {
      return await this.execute('/ip/hotspot/active/print');
    } catch (error) {
      console.error(`❌ Erreur liste utilisateurs actifs MikroTik: ${error.message}`);
      return [];
    }
  }

  /**
   * Teste la connexion à MikroTik
   */
  async testConnection() {
    try {
      await this.connect();
      const result = await this.execute('/system/resource/print');
      console.log('✅ Connexion MikroTik OK');
      return { 
        success: true, 
        info: {
          version: result[0]?.version,
          uptime: result[0]?.uptime,
          boardName: result[0]?.['board-name']
        }
      };
    } catch (error) {
      console.error(`❌ Connexion MikroTik échouée: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const mikrotikApi = new MikrotikApi();
export default MikrotikApi;
