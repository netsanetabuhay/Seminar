const Joi = require('joi');

const userValidation = {
    updateProfile: Joi.object({
        username: Joi.string().min(3).max(30).optional(),
        email: Joi.string().email().optional()
    })
};

module.exports = userValidation;