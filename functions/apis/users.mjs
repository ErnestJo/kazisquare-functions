import bfastnode from "bfastnode";

const { bfast } = bfastnode;

export const getUser = bfast.functions().onGetHttpRequest(
    '/users/:mobile',
    (request, response) => {
        const mobile = request.params.mobile;
        bfast.database().table('users').get(mobile).then(value => {
            if (value && !Array.isArray(value)) {
                response.status(200).json(value);
            } else {
                response.status(404).json({ message: 'no such user' });
            }
        }).catch(reason => {
            // if(reason && reason.message && reason.message.toString().trim() === 'Query not succeed'){
            //     return bfast.database().table('users').save(body).then(value=>{
            //         response.status(200).json(value);
            //     }).catch(reason=>{
            //         response.status(400).json(reason);
            //     });
            // }else{
            response.status(400).json(reason);
            // }
        });
    }
);

export const registerUser = bfast.functions().onPostHttpRequest(
    '/users/:mobile',
    (request, response) => {
        const mobile = request.params.mobile;
        const body = JSON.parse(JSON.stringify(request.query?request.query: {}));
        // console.log(body);
        bfast.database().table('users').get(mobile).then(user => {
            return bfast.database().table('users').query().byId(user.id).updateBuilder()
                .raw({
                    "$set": body
                })
                .update();
        }).then(value => {
            response.status(200).json(value);
        }).catch(reason => {
            if(reason && reason.message && reason.message.toString().trim() === 'Query not succeed'){
                const _body = Object.assign(body, {id: mobile});
                return bfast.database().table('users').save(body).then(value=>{
                    response.status(200).json(value);
                }).catch(reason=>{
                    response.status(400).json(reason);
                });
            }else{
                response.status(400).json(reason);
            }
        });
    }
)