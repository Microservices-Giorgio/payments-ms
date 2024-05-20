import 'dotenv/config'
import * as Joi from 'joi'

interface EnvVars {
    PORT: number
    STRIPE_SECRET: string
    STRIPE_SUCCESS_URL: string
    STRIPE_CANCEL_URL: string
    STRIPE_ENDPOINT_SECRET: string
}

const envsSchema = Joi.object({
    PORT: Joi.number().required(),
    STRIPE_SECRET: Joi.string().required(),
    STRIPE_SUCCESS_URL: Joi.string().required(),
    STRIPE_CANCEL_URL: Joi.string().required(),
    STRIPE_ENDPOINT_SECRET: Joi.string().required()
})
.unknown(true)

const {error, value} = envsSchema.validate(process.env)

if(error){
    throw new Error(`Config validation error: ${error.message}`)
}

const envVars:EnvVars = value

export const envs = {
    port: envVars.PORT,
    stripeSecret: envVars.STRIPE_SECRET,
    stripeSuccessUrl: envVars.STRIPE_SUCCESS_URL,
    stripeCancelledUrl: envVars.STRIPE_CANCEL_URL,
    stripeEndpointSecret: envVars.STRIPE_ENDPOINT_SECRET
}