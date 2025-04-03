const objectId = (value, helpers) => {
    if (!value.match(/^[0-9a-fA-F]{24}$/)) {
        return helpers.message('"{{#label}}" phải là ObjectId của mongo');
    }
    return value;
};

const password = (value, helpers) => {
    if (value.length < 8) {
        return helpers.message('Mật khẩu tối thiểu 8 ký tự');
    }
    if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
        return helpers.message('Mật khẩu phải chứa ít nhất 1 chữ cái hoặc 1 số');
    }
    return value;
};

const emails = (value, helpers) => {
    if (!value.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
        return helpers.message('Email không hợp lệ');
    }
    return value;
};

module.exports = {
    objectId,
    password,
    emails,
};