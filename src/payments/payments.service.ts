import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto';
import {Request, Response} from 'express'

@Injectable()
export class PaymentsService {
    private readonly stripe = new Stripe(envs.stripeSecret)


    async createPaymentSession(paymentSessionDto:PaymentSessionDto){
        const {currency, items, orderId} = paymentSessionDto

        const lineItems = items.map(item=>{
            return {
                price_data: {
                    currency: currency,
                    product_data: {
                        name: item.name
                    },
                    unit_amount: Math.round(item.price * 100), // 20 dolares 2000/100=20.00
                },
                quantity: item.quantity
            }
        })

        const session = await this.stripe.checkout.sessions.create({
            // Colocar aqui el ID de mi orden
            payment_intent_data: {
                metadata: {
                    orderId: orderId
                }
            },
            line_items: lineItems,
            mode: 'payment',
            success_url: 'http://localhost:3003/payments/success',
            cancel_url: 'http://localhost:3003/payments/cancelled'
        })
        return session
    }

    async stripeWebhook(req: Request, res: Response){
        const sig = req.headers['stripe-signature'];

        let event: Stripe.Event
        // Solo testing
        //        const endpointSecret = "whsec_25bc1436ef0bbb03791c7b5647b32091ad9b3539f59550155a472ac127314934";
        const endpointSecret = "whsec_c5VuxNUKieOlkFNMARAblth04lyFCAxz";

        try {
            event = this.stripe.webhooks.constructEvent(req['rawBody'], sig, endpointSecret);
        } catch (err) {
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        switch(event.type){
            case 'charge.succeeded':
                const chargeSucceeded = event.data.object
                //
                console.log({
                    orderId: chargeSucceeded.metadata.orderId
                })
            break;

            default:
                console.log(`Event ${event.type} not handler`)
        }
        
        return res.status(200).json({sig})
    }
}
