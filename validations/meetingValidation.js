const Joi = require('joi');

const meetingValidation = {
    createMeeting: Joi.object({
        title: Joi.string().max(100).optional()
    }),

    joinMeeting: Joi.object({
        meetingCode: Joi.string().length(6).required().messages({
            'string.length': 'Meeting code must be 6 characters',
            'any.required': 'Meeting code is required'
        })
    })
};

module.exports = meetingValidation;