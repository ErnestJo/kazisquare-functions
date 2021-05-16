import bfastnode from "bfastnode";

const {bfast} = bfastnode;

export const getUserv2 = bfast.functions().onGetHttpRequest(
    '/users/:uuid',
    (request, response) => {
        const uuid = request.params.uuid;
        bfast.database().table('_User').get(uuid, {useMasterKey: true}).then(value => {
            if (value && !Array.isArray(value) && value.name) {
                delete value.username;
                delete value.role;
                delete value.password;
                delete value.email;
                response.status(200).json({user: value});
            } else {
                response.status(200).json({user: 'hamna'});
            }
        }).catch(reason => {
            console.log(reason);
            response.status(400).json(reason);
        });
    }
);

export const registerUser = bfast.functions().onPostHttpRequest(
    '/users',
    (request, response) => {
        const body = request.body;
        if (body && body.uuid) {
            body.id = body.uuid;
            body.email = `${body.id}@kazisquare.co.tz`;
            bfast.database().table('users').get(body.id).then(user => {
                if (user) {
                    return bfast.database().table('_User')
                        .query()
                        .byId(user.id)
                        .updateBuilder()
                        .doc(body)
                        .update({useMasterKey: true});
                } else {
                    return bfast.auth().signUp(body.id, body.id, body);
                }
            }).then(value => {
                response.status(200).json(value);
            }).catch(reason => {
                console.log(reason);
                response.status(400).json(reason);
            });
        } else {
            response.status(400).json({message: 'invalid data'});
        }
    }
);
