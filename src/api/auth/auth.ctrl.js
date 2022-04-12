import Joi from 'joi';
import User from '../../models/user';

/* 
    POST /api/auth/register
    {
        username : 'velopert',
        password : 'mypass1234'
    }
*/

export const register = async ctx => {
    // Request Body 유효성 검사
    const schema = Joi.object().keys({
        username : Joi.string()
        .alphanum()
        .min(3)
        .max(20)
        .required(),
        password : Joi.string().required()
    });

    const result = schema.validate(ctx.request.body);
    if(result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }
    const {username, password} = ctx.request.body;

    // 중복 검사
    try{
        // 이미 존재하는 유저인지 확인
        const exists = await User.findByUsername(username);
        if(exists) {
            ctx.status = 409;
            ctx.body = {
                code : 'DUPLICATED_USERNAME',
                message : '중복된 유저 이름입니다.'
            };
            return;
        }

        const user = new User({
            username,
        });
        await user.setPassword(password); // 비밀번호 암호화
        await user.save(); // 데이터베이스에 저장
        ctx.body = user.serialize();
        // 응답할 데이터에서   hashedPassword 제거
        // const data = user.toJSON();
        // console.log(data);
        // delete data.hashedPassword;
        // ctx.body = data;
        const token = user.generateToken();
        ctx.cookies.set('access_token', token, {
            maxAge : 1000 * 60 * 60 * 24 * 7, // 7일
            httpOnly : true,
        });
    }
    catch(e){
        ctx.throw(500, e);
    }
};


export const login = async ctx => {
    const {username, password} = ctx.request.body;
    if(!username || !password) {
        ctx.status = 401; // unauthorized
        ctx.body = {
            code : 'NO_CREDENTIALS',
            message : '아이디 또는 패스워드가 누락 되었습니다.'
        };
        return;
    }

    try{
        const user = await User.findByUsername(username);
        // 계정이 존재 하지 않으면 에러 처리
        if(!user) {
            ctx.status = 401;
            ctx.body = {
                code : 'NO_CREDENTIALS',
                message : '아이디 오류입니다.'
            };
            return;
        }
        // 비밀번호 확인
        const valid = await user.checkPassword(password);
        if(!valid) {
            ctx.status = 401;
            ctx.body = {
                code : 'NO_CREDENTIALS',
                message : '패스워드 오류입니다.'
            };
            return;
        }
        ctx.body = user.serialize();
        const token = user.generateToken();
        ctx.cookies.set('access_token', token, {
            maxAge : 1000 * 60 * 60 * 24 * 7, // 7일
            httpOnly : true,
        });
    }
    catch(e){
        ctx.throw(500, e);
    }
};

export const check = async ctx => {
    const {user} = ctx.state;
    if(!user){
        // 로그인 중 아님
        ctx.status = 401;
        return;
    }
    ctx.body = user;
};

/*
    POST /api/auth/logout
*/
export const logout = async ctx => {
    ctx.cookies.set('access_token');
    ctx.status = 204;
};