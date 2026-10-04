import React, { useState } from "react";

import {
    createMentorPaymentOrder,
    verifyMentorPayment
} from "../../api/mentorApi";

import { loadRazorpay } from "../../utils/loadRazorpay";


const MentorPaymentButton = ({
    mentor,
    onPaymentSuccess
}) => {

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    const handlePayment = async () => {

        try {

            setLoading(true);
            setError("");

            /*
             * Load Razorpay Checkout script
             */
            const razorpayLoaded =
                await loadRazorpay();

            if (!razorpayLoaded) {

                throw new Error(
                    "Unable to load Razorpay Checkout"
                );
            }


            /*
             * Create order from backend
             */
            const order =
                await createMentorPaymentOrder(
                    mentor.id
                );


            /*
             * Razorpay Checkout options
             */
            const options = {

                key: order.keyId,

                amount: order.amount,

                currency: order.currency,

                name: "IET Connect",

                description:
                    `Mentor Access - ${mentor.name}`,

                order_id:
                    order.orderId,


                /*
                 * Called after successful payment
                 */
                handler:
                    async function (response) {

                        try {

                            /*
                             * Verify payment
                             * on our backend.
                             */
                            const verified =
                                await verifyMentorPayment({

                                    mentorId:
                                        mentor.id,

                                    razorpayOrderId:
                                        response
                                            .razorpay_order_id,

                                    razorpayPaymentId:
                                        response
                                            .razorpay_payment_id,

                                    razorpaySignature:
                                        response
                                            .razorpay_signature
                                });


                            /*
                             * Payment + verification successful
                             */
                            if (
                                verified &&
                                verified.chatAllowed
                            ) {

                                onPaymentSuccess(
                                    verified
                                );

                            } else {

                                throw new Error(
                                    "Payment verified but chat access was not activated"
                                );
                            }

                        } catch (err) {

                            console.error(
                                "Payment verification error:",
                                err
                            );

                            setError(
                                err?.response?.data?.message ||
                                "Payment verification failed"
                            );
                        }
                    },


                prefill: {

                    name:
                        mentor.name || "",

                    email:
                        ""
                },


                notes: {

                    mentorId:
                        String(mentor.id)
                },


                theme: {

                    color: "#2563eb"
                }
            };


            /*
             * Create Razorpay instance
             */
            const razorpay =
                new window.Razorpay(
                    options
                );


            /*
             * Payment failed
             */
            razorpay.on(
                "payment.failed",
                function (response) {

                    console.error(
                        "Razorpay payment failed:",
                        response.error
                    );

                    setError(
                        response?.error?.description ||
                        "Payment failed"
                    );

                    setLoading(false);
                }
            );


            /*
             * Open Checkout
             */
            razorpay.open();

            setLoading(false);

        } catch (err) {

            console.error(
                "Payment initialization error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to start payment"
            );

            setLoading(false);
        }
    };


    return (
        <div>

            {error && (
                <div className="payment-error">
                    {error}
                </div>
            )}

            <button
                type="button"
                onClick={handlePayment}
                disabled={loading}
                className="pay-mentor-btn"
            >

                {loading
                    ? "Processing..."
                    : `Pay ₹${mentor.price}`
                }

            </button>

        </div>
    );
};


export default MentorPaymentButton;