/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { FormField } from "../ui/form-field";
import { Section, SectionHeading } from "./primitives/Section";
import { Reveal } from "./primitives/Reveal";
import { CONTACT } from "./content";
import { postApi } from "../../redux/apis";
import { APIEndpoints } from "../../constants/constants";
import { toastText } from "../../utils/toast";

// Mirrors the validation the previous antd form enforced: all fields required, email must be valid.
const inquirySchema = z.object({
  name: z.string().trim().min(1, "Please enter your name"),
  email: z.string().trim().min(1, "Please enter your email").email("Please enter a valid email"),
  phone: z.string().trim().min(1, "Please enter your phone number"),
  message: z.string().trim().min(1, "Please enter your message"),
});

type InquiryValues = z.infer<typeof inquirySchema>;

const CONTACT_ITEMS = [
  { icon: Phone, label: "Phone", value: CONTACT.phone, href: CONTACT.phoneHref },
  { icon: Mail, label: "Email", value: CONTACT.email, href: CONTACT.emailHref },
  { icon: MapPin, label: "Address", value: CONTACT.addressLines.join(" "), href: undefined },
];

export const ContactSection = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquiryValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  // Same endpoint and payload shape as before — `phone` is mapped to the backend's `phoneNumber`.
  const onSubmit = async (values: InquiryValues) => {
    setIsSubmitting(true);
    try {
      const response = await postApi(APIEndpoints.SubmitInquiry, {
        name: values.name,
        email: values.email,
        phoneNumber: values.phone,
        message: values.message,
      });

      if (response?.data?.statusCode === 200) {
        toastText("Thank you for your interest! We will contact you soon.", "success");
        reset();
      } else {
        toastText(
          response?.data?.message || "Failed to submit inquiry. Please try again.",
          "error"
        );
      }
    } catch (error: any) {
      console.error("Error submitting inquiry form:", error);
      toastText(
        error?.response?.data?.message || "An error occurred. Please try again later.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section id="contact" tone="muted">
      <SectionHeading
        eyebrow="Contact"
        title="Get in touch"
        description="Questions about the syllabus, the tests or joining a batch? Send us a message and we will get back to you."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10">
        <Reveal className="flex flex-col gap-4">
          {CONTACT_ITEMS.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-4 rounded-xl border border-border bg-white p-5 shadow-dc-xs"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                <item.icon aria-hidden="true" className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    className="mt-1 block break-words text-[0.95rem] font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {item.value}
                  </a>
                ) : (
                  <address className="mt-1 not-italic text-[0.95rem] font-medium leading-relaxed text-foreground">
                    {CONTACT.addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                )}
              </div>
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.08}>
          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5 rounded-2xl border border-border bg-white p-6 shadow-dc-sm sm:p-8"
          >
            <h3 className="text-lg font-bold tracking-tight text-foreground">Send us a message</h3>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="inquiry-name" label="Your name" required error={errors.name?.message}>
                {(aria) => (
                  <Input
                    {...aria}
                    {...register("name")}
                    autoComplete="name"
                    placeholder="Enter your name"
                    invalid={Boolean(errors.name)}
                  />
                )}
              </FormField>

              <FormField id="inquiry-phone" label="Phone number" required error={errors.phone?.message}>
                {(aria) => (
                  <Input
                    {...aria}
                    {...register("phone")}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="Enter your phone number"
                    invalid={Boolean(errors.phone)}
                  />
                )}
              </FormField>
            </div>

            <FormField id="inquiry-email" label="Your email" required error={errors.email?.message}>
              {(aria) => (
                <Input
                  {...aria}
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  invalid={Boolean(errors.email)}
                />
              )}
            </FormField>

            <FormField id="inquiry-message" label="Your message" required error={errors.message?.message}>
              {(aria) => (
                <Textarea
                  {...aria}
                  {...register("message")}
                  rows={4}
                  placeholder="How can we help?"
                  invalid={Boolean(errors.message)}
                />
              )}
            </FormField>

            <Button type="submit" size="lg" block disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 aria-hidden="true" className="animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send aria-hidden="true" />
                  Send message
                </>
              )}
            </Button>
          </form>
        </Reveal>
      </div>
    </Section>
  );
};
