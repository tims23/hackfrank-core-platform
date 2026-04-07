import { Button, Input } from "@/components/ui"
import type { ApplicationFormState } from "./ApplicationForm.types"

interface Step1Props {
  form: ApplicationFormState
  isApplicationSubmitted: boolean
  isStep1Complete: boolean
  isSyncingStep: boolean
  error: string
  onUpdateField: (field: keyof ApplicationFormState, value: string) => void
  onNextStep: () => void
}

export function ApplicationFormStep1({
  form,
  isApplicationSubmitted,
  isStep1Complete,
  isSyncingStep,
  error,
  onUpdateField,
  onNextStep,
}: Step1Props) {
  return (
    <>
      <fieldset disabled={isApplicationSubmitted} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Prename</label>
          <Input
            type="text"
            value={form.prename}
            onChange={(event) => onUpdateField("prename", event.target.value)}
            placeholder="Your first name"
            className="w-full"
            maxLength={50}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Surname</label>
          <Input
            type="text"
            value={form.surname}
            onChange={(event) => onUpdateField("surname", event.target.value)}
            placeholder="Your last name"
            className="w-full"
            maxLength={50}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Birthday</label>
          <Input
            type="date"
            value={form.birthday}
            onChange={(event) => onUpdateField("birthday", event.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Gender</label>
          <Input
            type="text"
            value={form.gender}
            onChange={(event) => onUpdateField("gender", event.target.value)}
            placeholder="Your gender"
            className="w-full"
            maxLength={30}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
          <Input
            type="tel"
            value={form.phoneNumber}
            onChange={(event) => onUpdateField("phoneNumber", event.target.value)}
            placeholder="+49 ..."
            className="w-full"
            maxLength={30}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Nationality</label>
          <Input
            type="text"
            value={form.nationality}
            onChange={(event) => onUpdateField("nationality", event.target.value)}
            placeholder="Your nationality"
            className="w-full"
            maxLength={60}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">University</label>
          <Input
            type="text"
            value={form.university}
            onChange={(event) => onUpdateField("university", event.target.value)}
            placeholder="Your university"
            className="w-full"
            maxLength={120}
          />
        </div>
      </fieldset>

      {error && <p className="text-sm text-red-400 text-center">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Button
          type="button"
          className="w-full md:col-span-2"
          disabled={!isStep1Complete || isSyncingStep}
          onClick={onNextStep}
        >
          {isSyncingStep ? "Saving step 1..." : "Continue to Step 2"}
        </Button>
      </div>
    </>
  )
}
