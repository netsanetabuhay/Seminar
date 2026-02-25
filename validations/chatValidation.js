const Joi = require('joi');

const chatValidation = {
    sendMessage: Joi.object({
        meetingId: Joi.number().required(),
        message: Joi.string().max(500).required().messages({
            'string.max': 'Message cannot exceed 500 characters',
            'any.required': 'Message is required'
        })
    })
};

module.exports = chatValidation;