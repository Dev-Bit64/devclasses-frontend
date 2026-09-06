/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import { FormField } from '../ui/form-field';
import { toastText } from '../../utils/toast';

interface SendWhatsAppMessageProps {
    visible: boolean;
    onClose: () => void;
    studentName: string;
    phoneNumber?: string;
}

// Same rules the previous antd form enforced, transcribed message-for-message.
const whatsAppSchema = z.object({
    phoneNumber: z
        .string()
        .min(1, 'Please enter phone number')
        .regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
    message: z.string().min(1, 'Please enter a message'),
});

type WhatsAppValues = z.infer<typeof whatsAppSchema>;

const SendWhatsAppMessage: React.FC<SendWhatsAppMessageProps> = ({
    visible,
    onClose,
    studentName,
    phoneNumber = '',
}) => {
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<WhatsAppValues>({
        resolver: zodResolver(whatsAppSchema),
        defaultValues: { phoneNumber: '', message: '' },
    });

    // Set initial values when modal opens
    useEffect(() => {
        if (visible) {
            reset({
                phoneNumber: phoneNumber,
                message: `${studentName} is absent today`,
            });
        }
    }, [visible, studentName, phoneNumber, reset]);

    /**
     * Handle form submission
     */
    const handleFormSubmit = async (values: WhatsAppValues) => {
        try {
            setLoading(true);

            // Link is built from the phoneNumber prop, matching the previous behaviour.
            const waLink = `https://wa.me/${phoneNumber}?text=${values.message}`;

            // Open WhatsApp
            window.open(waLink, "_blank");

            toastText("Opening WhatsApp...", 'success');
            handleClose();
        } catch (error: any) {
            console.error('Error sending WhatsApp message:', error);
            if (error?.message) {
                toastText(error.message, 'error');
            } else {
                toastText('Failed to send WhatsApp message. Please try again.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle modal close
     */
    const handleClose = () => {
        reset({ phoneNumber: '', message: '' });
        onClose();
    };

    return (
        <Dialog open={visible} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-w-lg gap-5 p-5 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2.5">
                        <MessageCircle aria-hidden="true" className="size-5 text-success" />
                        Send WhatsApp Message
                    </DialogTitle>
                </DialogHeader>

                <form
                    noValidate
                    autoComplete="off"
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="flex flex-col gap-4"
                >
                    {/* Student name is contextual only and stays read-only. */}
                    <FormField id="wa-student" label="Student Name">
                        {(aria) => <Input {...aria} value={studentName} disabled readOnly />}
                    </FormField>

                    <FormField
                        id="wa-phone"
                        label="Phone Number"
                        required
                        error={errors.phoneNumber?.message}
                    >
                        {(aria) => (
                            <Input
                                {...aria}
                                {...register('phoneNumber')}
                                type="tel"
                                inputMode="numeric"
                                placeholder="Enter 10-digit phone number"
                                maxLength={10}
                                invalid={Boolean(errors.phoneNumber)}
                            />
                        )}
                    </FormField>

                    <FormField id="wa-message" label="Message" required error={errors.message?.message}>
                        {(aria) => (
                            <Textarea
                                {...aria}
                                {...register('message')}
                                rows={4}
                                placeholder="Enter your message"
                                invalid={Boolean(errors.message)}
                            />
                        )}
                    </FormField>

                    <DialogFooter>
                        <Button variant="secondary" onClick={handleClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Spinner /> : <MessageCircle aria-hidden="true" />}
                            Send
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SendWhatsAppMessage;
