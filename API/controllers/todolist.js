// The controller for the Todo List API endpoints. It uses the functions from permissionUtils.js to check if the request has the necessary permissions to perform actions like reading or writing to the Todo list. The controller also uses the functions from permissionUtils.js to check if the access token is for a user or an application. If the access token is for a user, the controller uses the 'oid' claim to uniquely identify the user. If the access token is for an application, the controller uses the 'roles' claim to determine the application's role. The controller uses the 'idtyp' claim to determine if the access token is for a user or an application. The 'idtyp' claim is an optional claim that can be enabled in the Azure AD app registration. For more information, see: https://docs.microsoft.com/azure/active-directory/develop/access-tokens#user-and-application-tokens

// Controllers should check if the presented access token has the necessary permissions to access the data, depending on the type of permission. For example, if the API is protected with delegated permissions, the controller should check if the access token has the necessary delegated permissions. If the API is protected with application permissions, the controller should check if the access token has the necessary application permissions. If the API is protected with both delegated and application permissions, the controller should check if the access token has the necessary delegated permissions and application permissions.
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('./data/db.json');
const db = lowdb(adapter);

const {
  isAppOnlyToken,
  hasRequiredDelegatedPermissions,
  hasRequiredApplicationPermissions
} = require('../auth/permissionUtils');

const authConfig = require('../authConfig');

exports.getTodo = (req, res, next) => {
    if (isAppOnlyToken(req.authInfo)) {
        if (hasRequiredApplicationPermissions(req.authInfo, authConfig.protectedRoutes.todolist.applicationPermissions.read)) {
            try {
                const id = req.params.id;
    
                const todo = db.get('todos')
                    .find({ id: id })
                    .value();
    
                res.status(200).send(todo);
            } catch (error) {
                next(error);
            }
        } else {
            next(new Error('Application does not have the required permissions'))
        }
    } else {
        if (hasRequiredDelegatedPermissions(req.authInfo, authConfig.protectedRoutes.todolist.delegatedPermissions.read)) {
            try {
                /**
                 * The 'oid' (object id) is the only claim that should be used to uniquely identify
                 * a user in an Azure AD tenant. The token might have one or more of the following claim,
                 * that might seem like a unique identifier, but is not and should not be used as such,
                 * especially for systems which act as system of record (SOR):
                 *
                 * - upn (user principal name): might be unique amongst the active set of users in a tenant but
                 * tend to get reassigned to new employees as employees leave the organization and
                 * others take their place or might change to reflect a personal change like marriage.
                 *
                 * - email: might be unique amongst the active set of users in a tenant but tend to get
                 * reassigned to new employees as employees leave the organization and others take their place.
                 */
                const owner = req.authInfo['oid'];
                const id = req.params.id;
    
                const todo = db.get('todos')
                    .filter({ owner: owner })
                    .find({ id: id })
                    .value();
    
                res.status(200).send(todo);
            } catch (error) {
                next(error);
            }
        } else {
            next(new Error('User does not have the required permissions'))
        }
    }
}

exports.getTodos = (req, res, next) => {
    if (isAppOnlyToken(req.authInfo)) {
        if (hasRequiredApplicationPermissions(req.authInfo, authConfig.protectedRoutes.todolist.applicationPermissions.read)) {
            try {
                const todos = db.get('todos')
                    .value();
    
                res.status(200).send(todos);
            } catch (error) {
                next(error);
            }
        } else {
            next(new Error('Application does not have the required permissions'))
        }
    } else {
        if (hasRequiredDelegatedPermissions(req.authInfo, authConfig.protectedRoutes.todolist.delegatedPermissions.read)) {
            try {
                const owner = req.authInfo['oid'];
    
                const todos = db.get('todos')
                    .filter({ owner: owner })
                    .value();
    
                res.status(200).send(todos);
            } catch (error) {
                next(error);
            }
        } else {
            next(new Error('User does not have the required permissions'))
        }
    }
}

exports.postTodo = (req, res, next) => {
    if (hasRequiredDelegatedPermissions(req.authInfo, authConfig.protectedRoutes.todolist.delegatedPermissions.write)
        ||
        hasRequiredApplicationPermissions(req.authInfo, authConfig.protectedRoutes.todolist.applicationPermissions.write)
    ) {
        try {
            db.get('todos').push(req.body).write();
            res.status(200).json({ message: "success" });
        } catch (error) {
            next(error);
        }
    } else (
        next(new Error('User or application does not have the required permissions'))
    )
}

exports.updateTodo = (req, res, next) => {
    if (isAppOnlyToken(req.authInfo)) {
        if (hasRequiredApplicationPermissions(req.authInfo, authConfig.protectedRoutes.todolist.applicationPermissions.write)) {
            try {
                const id = req.params.id;
    
                db.get('todos')
                    .find({ id: id })
                    .assign(req.body)
                    .write();
    
                res.status(200).json({ message: "success" });
            } catch (error) {
                next(error);
            }
        } else {
            next(new Error('Application does not have the required permissions'))
        }
    } else {
        if (hasRequiredDelegatedPermissions(req.authInfo, authConfig.protectedRoutes.todolist.delegatedPermissions.write)) {
            try {
                const id = req.params.id;
                const owner = req.authInfo['oid'];
    
                db.get('todos')
                    .filter({ owner: owner })
                    .find({ id: id })
                    .assign(req.body)
                    .write();
    
                res.status(200).json({ message: "success" });
            } catch (error) {
                next(error);
            }
        } else {
            next(new Error('User does not have the required permissions'))
        }
    }
}

exports.deleteTodo = (req, res, next) => {
    if (isAppOnlyToken(req.authInfo)) {
        if (hasRequiredApplicationPermissions(req.authInfo, authConfig.protectedRoutes.todolist.applicationPermissions.write)) {
            try {
                const id = req.params.id;
    
                db.get('todos')
                    .remove({ id: id })
                    .write();
    
                res.status(200).json({ message: "success" });
            } catch (error) {
                next(error);
            }
        } else {
            next(new Error('Application does not have the required permissions'))
        }
    } else {
        if (hasRequiredDelegatedPermissions(req.authInfo, authConfig.protectedRoutes.todolist.delegatedPermissions.write)) {
            try {
                const id = req.params.id;
                const owner = req.authInfo['oid'];
    
                db.get('todos')
                    .remove({ owner: owner, id: id })
                    .write();
    
                res.status(200).json({ message: "success" });
            } catch (error) {
                next(error);
            }
        } else {
            next(new Error('User does not have the required permissions'))
        }
    }
}
