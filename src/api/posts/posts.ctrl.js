import Post from '../../models/post';
import mongoose from 'mongoose';
import Joi from 'joi';

const {ObjectId} = mongoose.Types;

// 현재 로그인 중인 사용자가 작성한 게시글인지 조회 합니다.
export const checkOwnPost = async (ctx, next) => {
    console.log('checkOwnPost 호출됨');
    const {user, post} = ctx.state;
    if( post.user._id .toString() !== user._id.toString()){
        ctx.status = 403;
        return;
    }
    return next();
};

export const getPostById = async (ctx, next) => {
    console.log('getPostById 호출됨');
    const {id} = ctx.params;
    console.log(`ctx.params : id = ${id}`);
    if(!ObjectId.isValid(id)) {
        ctx.status = 400; // Bad Request
        return;
    }
    try {
        const post = await Post.findById(id);
        // 포스트가 존재하지 않을 경우 
        if(!post) {
            ctx.status = 404; // Not Found
            return;
        }
        ctx.state.post = post;
        return next();
    } catch(e) {
        ctx.throw(500, e);
    }

    return next();
};

export const write = async ctx => {
    // 객채가 다음 필드를 가지고 있음을 증명
    const schema = Joi.object().keys({
        title: Joi.string().required(),
        body : Joi.string().required(),
        tags: Joi.array().items(Joi.string()).required(),
    });

    const result = schema.validate(ctx.request.body);
    if(result.error) {
        ctx.status = 400; // Bad Request
        ctx.body = result.error;
        return;
    }

    const {title, body, tags} = ctx.request.body;
    const post = new Post({
        title,
        body,
        tags,
        user : ctx.state.user, // 현재 로그인한 유저 정보를 포스트에 저장
    });
    try{
        await post.save();
        ctx.body = post;
    }
    catch(e){
        ctx.throw(500,e);
    }
};

export const list = async ctx => {
    console.log('postCtrl list 호출됨');
    // query는 문자열이기 때문에 숫자로 변환해 주어야 합니다.
    // 값이 주어지지 않는다면 1을 기본값으로 설정합니다.
    const page = parseInt(ctx.query.page || '1', 10);
    if(page <1){
        ctx.status = 400;
        return;
    }

    try{
        const posts = await Post.find()
            .sort({_id: -1}) // 최신글 순으로 정렬 아이디 기준 역순 정렬
            .limit(10) // 최대 10개만 가져옴 페이지 단위를 10 설정
            .skip( (page-1)*10)
            .exec();
        const postCount = await Post.countDocuments().exec();
        ctx.set('Last-page', Math.ceil(postCount/10));
        ctx.body = posts;
    }
    catch(e){
        ctx.throw(500,e);
    }
};

export const read = async ctx => {
    console.log('postCtrl read 호출됨');
    ctx.body = ctx.state.post;
    // const {id} = ctx.params;
    // try {
    //      const post = await Post.findById(id).exec();
    //     if(!post){
    //         ctx.status = 404; // not found
    //         return;
    //     } ;
    //     ctx.body = post;
    // }
    // catch(e){
    //     ctx.throw(500,e);
    // }
};

export const remove = async ctx => {
    const {id} = ctx.params;
    try{
        // console.log(`remove id : ${id}`);
        await Post.findByIdAndRemove(id).exec();
        ctx.status = 204; // no content
        // if(!post){
        //     ctx.status = 404; // not found
        //     return;
        // }
    }
    catch(e){
        ctx.throw(500,e);
    }
};

export const update = async ctx => {
    /* PATCH /api/posts/:id
    {
        title : '수정된 제목',
        body : '수정된 본문',
        tags : ['수정된 태그1', '수정된 태그2']
    }

    */

    const {id } = ctx.params;

    // write에서 사용한 schema와 비슷하나 required()가 없음
    const schema = Joi.object().keys({
        title: Joi.string(),
        body : Joi.string(),
        tags: Joi.array().items(Joi.string()),
    });
    // 검증하고 나서 검증 실패한 경우 에러 처리
    const result = schema.validate(ctx.request.body);

    if(result.error){
        ctx.status = 400; // Bad Request
        ctx.body = result.error;
        return;
    }

    try{
        const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
            new: true, // 이 값이 true이면 업데이트된 값을 반환합니다.
            // false일 경우 업데이트 이전의 데이터를 반환 합니다.
        }).exec();
        if(!post){
            ctx.status = 404; // not found
            return;
        }
        ctx.body = post;
    }
    catch(e){
        ctx.throw(500,e);
    }
};