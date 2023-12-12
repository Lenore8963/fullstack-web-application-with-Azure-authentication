// This file configures the Azure authentication settings for the back-end. It includes the tenant ID, client ID, and other metadata required for Azure AD authentication. It also includes the protected routes for the API, which are the routes that require authentication to access. The protected routes are defined in the protectedRoutes object. The endpoint property is the route that is protected, and the delegatedPermissions and applicationPermissions properties are the permissions that are required to access the route. The delegatedPermissions property is for delegated permissions, and the applicationPermissions property is for application permissions. The permissions are defined in the Azure AD app registration.

const passportConfig = {
    credentials: {
        tenantID: "a8eec281-aaa3-4dae-ac9b-9a398b9215e7",
        clientID: "b6ffbd30-541d-46cd-bcd6-4c67dddaf04c"
    },
    metadata: {
        authority: "login.microsoftonline.com",
        discovery: ".well-known/openid-configuration",
        version: "v2.0"
    },
    settings: {
        validateIssuer: true,
        passReqToCallback: true,
        loggingLevel: "info",
        loggingNoPII: true,
    },
    protectedRoutes: {
        todolist: {
            endpoint: "/api/todolist",
            delegatedPermissions: {
                read: ["Todolist.Read", "Todolist.ReadWrite"],
                write: ["Todolist.ReadWrite"]
            },
            applicationPermissions: {
                read: ["Todolist.Read.All", "Todolist.ReadWrite.All"],
                write: ["Todolist.ReadWrite.All"]
            }
        }
    }
}

module.exports = passportConfig;
