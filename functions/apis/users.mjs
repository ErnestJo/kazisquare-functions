import bfastnode from "bfastnode";

const { bfast } = bfastnode;

export const getUser = bfast.functions().onGetHttpRequest(
    '/users/:mobile',
    (request, response) => {
        const mobile = request.params.mobile;
        bfast.database().table('users').get(mobile).then(value => {
            if (value && !Array.isArray(value) && value.name && value.age) {
                response.status(200).json(value);
            } else {
                response.status(404).json({ message: 'registration not completed' });
            }
        }).catch(reason => {
            console.log(reason);
            response.status(400).json(reason);
        });
    }
);

export const registerUser = bfast.functions().onPostHttpRequest(
    '/users/:uuid',
    (request, response) => {
        const uuid = request.params.uuid;
        const body = request.body;
        // console.log(body);
        bfast.database().table('users').get(uuid).then(user => {
            return bfast.database().table('users')
                .query()
                .byId(user.id)
                .updateBuilder()
                .doc(body)
                .update();
            // Object.keys(body).forEach(key=>{
            //     updateBuilder.set(key, body[key])
            // });
            // return updateBuilder.update();
        }).then(value => {
            response.status(200).json(value);
        }).catch(reason => {
            console.log(reason);
            if(reason && reason.message && reason.message.toString().trim() === 'Query not succeed'){
               // const _body = Object.assign(body, {id: uuid});
                return bfast.database().table('users').save(body).then(value=>{
                    response.status(200).json(value);
                }).catch(reason=>{
                    console.log(reason);
                    response.status(400).json(reason);
                });
            }else{
                response.status(400).json(reason);
            }
        });
    }
)