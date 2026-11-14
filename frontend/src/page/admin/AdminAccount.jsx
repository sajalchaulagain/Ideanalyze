import { useState } from "react";
import { Eye, EyeOff, KeyRound, Save } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { changePassword } from "../../service/api";
import Button from "../../components/Button";
import ErrorState from "../../components/ErrorState";
import SuccessMessage from "../../components/SuccessMessage";
import Card from "../../components/ui/Card";
import FormField from "../../components/ui/FormField";
import { inputClass } from "../../components/ui/formStyles";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";

const FIELDS = [
  {
    name: "currentPassword",
    label: "Current password",
    id: "admin-current-password",
    autoComplete: "current-password",
    hint: "Required so a stolen session cannot lock you out.",
  },
  {
    name: "newPassword",
    label: "New password",
    id: "admin-new-password",
    autoComplete: "new-password",
    hint: "At least 8 characters, including a letter and a number.",
  },
  {
    name: "confirmPassword",
    label: "Confirm new password",
    id: "admin-confirm-password",
    autoComplete: "new-password",
    hint: "Type the new password once more.",
  },
];

const EMPTY_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function AdminAccount() {
  useDocumentMeta(
    "Admin password · Ideanalyze AI",
    "Change the password for your admin account."
  );

  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [visible, setVisible] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
    setServerError("");
    setSuccess("");
  };

  const toggleVisible = (name) => {
    setVisible((current) => ({ ...current, [name]: !current[name] }));
  };

  const validate = () => {
    const next = {};

    if (!form.currentPassword) {
      next.currentPassword = "Enter your current password.";
    }
    if (!form.newPassword) {
      next.newPassword = "Enter a new password.";
    } else if (form.newPassword.length < 8) {
      next.newPassword = "Use at least 8 characters.";
    } else if (form.newPassword === form.currentPassword) {
      next.newPassword = "New password must be different from the current password.";
    }
    if (!form.confirmPassword) {
      next.confirmPassword = "Confirm the new password.";
    } else if (form.confirmPassword !== form.newPassword) {
      next.confirmPassword = "The two passwords do not match.";
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    setServerError("");
    setSuccess("");
    if (saving || !validate()) return;

    setSaving(true);
    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm(EMPTY_FORM);
      setVisible({ currentPassword: false, newPassword: false, confirmPassword: false });
      setSuccess(
        "Password changed. Your new password is active immediately and will be required the next time you sign in — you stay signed in on this device."
      );
      showToast("Admin password updated.");
    } catch (error) {
      if (error.code === "PASSWORD_MISMATCH") {
        setFieldErrors({ currentPassword: error.message });
      } else if (error.code === "PASSWORD_UNCHANGED") {
        setFieldErrors({ newPassword: error.message });
      } else if (error.field === "newPassword" || error.field === "currentPassword") {
        setFieldErrors({ [error.field]: error.message });
      } else {
        setServerError(error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div>
        <h2 className="text-lg font-semibold text-fg">Admin password</h2>
        <p className="mt-1 text-sm leading-6 text-fg-muted">
          This is the same account password you use to sign in. Changing it here
          keeps your current session valid on this device.
        </p>
      </div>

      <Card className="mt-4 p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <KeyRound className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="text-sm font-semibold text-fg">Change password</p>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-5" noValidate>
          {serverError && <ErrorState message={serverError} />}

          {FIELDS.map((field) => (
            <FormField
              key={field.name}
              label={field.label}
              htmlFor={field.id}
              required
              error={fieldErrors[field.name]}
              hint={field.hint}
            >
              <div className="relative">
                <input
                  id={field.id}
                  name={field.name}
                  type={visible[field.name] ? "text" : "password"}
                  autoComplete={field.autoComplete}
                  value={form[field.name]}
                  onChange={update}
                  className={`${inputClass} pr-12`}
                  aria-invalid={Boolean(fieldErrors[field.name])}
                />
                <button
                  type="button"
                  onClick={() => toggleVisible(field.name)}
                  className="absolute right-0.5 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-muted hover:text-fg"
                  aria-label={
                    visible[field.name]
                      ? `Hide ${field.label.toLowerCase()}`
                      : `Show ${field.label.toLowerCase()}`
                  }
                  aria-pressed={visible[field.name]}
                >
                  {visible[field.name] ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </FormField>
          ))}

          {success && <SuccessMessage message={success} />}

          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Update password
            </Button>
          </div>
        </form>
      </Card>

      <p className="mt-4 text-xs leading-5 text-fg-subtle">
        If you ever forget it, an operator with server access can promote or
        reset an account. There is no self-service reset link in the app.
      </p>
    </div>
  );
}
