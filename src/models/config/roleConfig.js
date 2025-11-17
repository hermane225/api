// Configuration des logins pour chaque rôle


export const adminLogins = [
  "admin",
  "superadmin",
  "administrateur",
  "admin_principal"
  // Ajoutez ici tous les logins qui doivent être admin
];

// Liste des logins qui sont des agents
export const agentLogins = [
  "agent",
  "agent1",
  "agent2",
  "support",
  "agent_support",
  "agent_technique"
  // Ajoutez ici tous les logins qui doivent être agent
];

/**
 * Détermine le rôle d'un utilisateur basé sur son login
 * @param {string} login - Le login de l'utilisateur
 * @returns {string} - Le rôle détecté ("admin", "agent", ou "user")
 */
export const getRoleFromLogin = (login) => {
  const lowerLogin = login.toLowerCase().trim();
  
  // Vérifier si le login est dans la liste des admins
  if (adminLogins.some(adminLogin => adminLogin.toLowerCase() === lowerLogin)) {
    return "admin";
  }
  
  // Vérifier si le login est dans la liste des agents
  if (agentLogins.some(agentLogin => agentLogin.toLowerCase() === lowerLogin)) {
    return "agent";
  }
  
  // Vérifier les préfixes (optionnel)
  if (lowerLogin.startsWith("admin_") || lowerLogin.startsWith("adm_")) {
    return "admin";
  }
  
  if (lowerLogin.startsWith("agent_") || lowerLogin.startsWith("agt_")) {
    return "agent";
  }
  
  // Par défaut, c'est un utilisateur normal
  return "user";
};