"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Enquiry } from "@/types/content";
import { site } from "@/content/site";
import { submitEnquiry } from "@/lib/enquiries";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@/components/ui/icons";
import { SelectField } from "@/components/ui/select-field";

type Fields = Omit<Enquiry, "consent"> & { consent: boolean };
type Errors = Partial<Record<keyof Fields, string>>;
type Status = "idle" | "sending" | "sent" | "failed";

const EMPTY: Fields = { name: "", phone: "", email: "", service: "", preferredDate: "", message: "", consent: false };

function validate(fields: Fields): Errors {
  const errors: Errors = {};
  if (fields.name.trim().length < 2) errors.name = "Please tell us your name.";
  if (fields.phone.replace(/\D/g, "").length < 10) errors.phone = "Please enter a phone number we can reach you on.";
  if (fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errors.email = "That email address does not look right.";
  if (fields.message.trim().length < 10) errors.message = "A sentence or two helps us prepare.";
  if (!fields.consent) errors.consent = "Please confirm so that we can contact you.";
  return errors;
}

/**
 * Appointment request form. Validates in the browser and hands the enquiry to
 * submitEnquiry (src/lib/enquiries.ts). Until a backend endpoint is configured
 * nothing is sent, and the confirmation says so plainly.
 */
export function AppointmentForm({ services }: { services: string[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [delivered, setDelivered] = useState(false);
  const [failure, setFailure] = useState("");

  function update<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(fields);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setStatus("sending");
    const result = await submitEnquiry(fields);
    if (result.ok) {
      setDelivered(result.delivered);
      setStatus("sent");
    } else {
      setFailure(result.error);
      setStatus("failed");
    }
  }

  const firstName = fields.name.trim().split(/\s+/)[0];

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-mist p-6 sm:p-10 lg:rounded-[2.75rem] lg:p-14">
      <AnimatePresence mode="wait" initial={false}>
        {status === "sent" ? (
          <motion.div
            key="sent"
            role="status"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
            className="flex min-h-[30rem] flex-col justify-center"
          >
            <span className="grid size-14 place-items-center rounded-full bg-emerald-700 text-white">
              <CheckIcon className="size-6" />
            </span>
            <h2 className="display-md mt-8 text-ink">
              Thank you{firstName ? `, ${firstName}` : ""}.
            </h2>
            {delivered ? (
              <p className="lede mt-5 max-w-md text-ink-soft">
                Your request has reached us. We will be in touch to arrange a time that suits you.
              </p>
            ) : (
              <>
                <p className="lede mt-5 max-w-md text-ink-soft">
                  This preview of the website is not connected to our inbox yet, so your request has not been
                  sent. Please call us to book your consultation.
                </p>
                <div className="mt-8">
                  <Button href={site.phone.href} icon={false}>{`Call ${site.phone.display}`}</Button>
                </div>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                setFields(EMPTY);
                setStatus("idle");
              }}
              className="link-line mt-8 w-fit pb-1 text-[0.92rem] font-medium text-emerald-700"
            >
              Send another request
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            ref={formRef}
            noValidate
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          >
            <h2 className="display-sm text-ink">Request an appointment</h2>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
              Share as much or as little as you like. Everything you write is treated in confidence.
            </p>

            <div className="mt-10 grid gap-x-8 gap-y-9 sm:grid-cols-2">
              <Field label="Your name" name="name" error={errors.name} required>
                <input
                  id="field-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={fields.name}
                  onChange={(event) => update("name", event.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "error-name" : undefined}
                  className={inputClass(Boolean(errors.name))}
                />
              </Field>

              <Field label="Phone number" name="phone" error={errors.phone} required>
                <input
                  id="field-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={fields.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "error-phone" : undefined}
                  className={inputClass(Boolean(errors.phone))}
                />
              </Field>

              <Field label="Email address" name="email" error={errors.email} hint="Optional">
                <input
                  id="field-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={fields.email}
                  onChange={(event) => update("email", event.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "error-email" : undefined}
                  className={inputClass(Boolean(errors.email))}
                />
              </Field>

              <Field label="Preferred date" name="preferredDate" hint="Optional">
                <input
                  id="field-preferredDate"
                  name="preferredDate"
                  type="date"
                  value={fields.preferredDate}
                  onChange={(event) => update("preferredDate", event.target.value)}
                  className={cn(inputClass(false), !fields.preferredDate && "text-ink-mute")}
                />
              </Field>

              <Field label="What can we help with?" name="service" hint="Optional" className="sm:col-span-2">
                <SelectField
                  id="field-service"
                  name="service"
                  label="What can we help with?"
                  value={fields.service}
                  onChange={(value) => update("service", value)}
                  options={[
                    { value: "", label: "I am not sure yet" },
                    ...services.map((service) => ({ value: service, label: service })),
                  ]}
                  className={cn(inputClass(false), !fields.service && "text-ink-mute")}
                />
              </Field>

              <Field label="A few words about what brings you here" name="message" error={errors.message} required className="sm:col-span-2">
                <textarea
                  id="field-message"
                  name="message"
                  rows={4}
                  value={fields.message}
                  onChange={(event) => update("message", event.target.value)}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "error-message" : undefined}
                  className={cn(inputClass(Boolean(errors.message)), "resize-y")}
                />
              </Field>
            </div>

            <div className="mt-9">
              <label className="flex cursor-pointer items-start gap-3.5 text-[0.92rem] leading-relaxed text-ink-soft">
                <input
                  type="checkbox"
                  name="consent"
                  checked={fields.consent}
                  onChange={(event) => update("consent", event.target.checked)}
                  aria-invalid={Boolean(errors.consent)}
                  aria-describedby={errors.consent ? "error-consent" : undefined}
                  className="peer sr-only"
                />
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 grid size-5 flex-none place-items-center rounded-md border transition-colors duration-300 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald-500",
                    fields.consent ? "border-emerald-700 bg-emerald-700 text-white" : "border-ink/30 bg-white",
                    errors.consent && "border-alert",
                  )}
                >
                  <CheckIcon className={cn("size-3.5 transition-opacity", fields.consent ? "opacity-100" : "opacity-0")} />
                </span>
                <span>I agree to be contacted by {site.name} about this request.</span>
              </label>
              {errors.consent ? (
                <p id="error-consent" className="mt-2 pl-[2.1rem] text-[0.82rem] text-alert">
                  {errors.consent}
                </p>
              ) : null}
            </div>

            {status === "failed" ? (
              <p role="alert" className="mt-7 rounded-xl bg-alert-soft px-5 py-4 text-[0.92rem] text-alert">
                {failure}
              </p>
            ) : null}

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Button type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Sending your request" : "Send request"}
              </Button>
              <p className="text-[0.84rem] text-ink-mute">
                Prefer to talk?{" "}
                <a href={site.phone.href} className="link-line pb-0.5 text-ink">
                  {site.phone.display}
                </a>
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function inputClass(invalid: boolean) {
  return cn(
    "block min-h-11 w-full border-b bg-transparent pb-3 pt-1 text-[1.02rem] text-ink outline-none transition-colors duration-300 focus:border-emerald-700",
    invalid ? "border-alert" : "border-ink/25",
  );
}

function Field({
  label,
  name,
  error,
  hint,
  required,
  className,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={`field-${name}`} className="eyebrow flex items-center justify-between text-ink-mute">
        <span>
          {label}
          {required ? <span className="text-emerald-700"> *</span> : null}
        </span>
        {hint ? <span className="font-medium normal-case tracking-normal text-ink-mute/70">{hint}</span> : null}
      </label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`error-${name}`} className="mt-2 text-[0.82rem] text-alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
