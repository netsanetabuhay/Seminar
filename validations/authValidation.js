const Joi = require('joi');

const authValidation = {
    register: Joi.object({
        username: Joi.string().min(3).max(30).required().messages({
            'string.min': 'Username must be at least 3 characters',
            'string.max': 'Username cannot exceed 30 characters',
            'any.required': 'Username is required'
        }),
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email',
            'any.required': 'Email is required'
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Password must be at least 6 characters',
            'any.required': 'Password is required'
        })
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    })
};

module.exports = authValidation;