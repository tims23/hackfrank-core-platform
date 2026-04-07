import { Button, Input, Textarea } from "@/components/ui"
import type { ApplicationFormState, Step2Field } from "./ApplicationForm.types"

interface Step2Props {
  form: ApplicationFormState
  isApplicationSubmitted: boolean
  isStep2Complete: boolean
  isSubmitting: boolean
  error: string
  onUpdateField: (field: keyof ApplicationFormState, value: string) => void
  onFieldBlur: (field: Step2Field) => void
  onNextStep: () => void
  onPrevStep: () => void
}

export function ApplicationFormStep2({
  form,
  isApplicationSubmitted,
  isStep2Complete,
  isSubmitting,
  error,
  onUpdateField,
  onFieldBlur,
  onNextStep,
  onPrevStep,
}: Step2Props) {
  return (
    <>
      <fieldset disabled={isApplicationSubmitted} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Current CV</label>
          <Input
            type="text"
            value={form.currentCv}
            onChange={(event) => onUpdateField("currentCv", event.target.value)}
            onBlur={() => onFieldBlur("currentCv")}
            placeholder="Link or reference to your CV"
            className="w-full"
            maxLength={250}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Motivation</label>
          <Textarea
            value={form.motivation}
            onChange={(event) => onUpdateField("motivation", event.target.value)}
            onBlur={() => onFieldBlur("motivation")}
            placeholder="Tell us why you want to join"
            className="w-full"
            maxLength={1500}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Programming Skill Level
          </label>
          <Input
            type="text"
            value={form.programmingSkillLevel}
            onChange={(event) => onUpdateField("programmingSkillLevel", event.target.value)}
            onBlur={() => onFieldBlur("programmingSkillLevel")}
            placeholder="Beginner, Intermediate, Advanced"
            className="w-full"
            maxLength={80}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">General Skills</label>
          <Input
            type="text"
            value={form.generalSkills}
            onChange={(event) => onUpdateField("generalSkills", event.target.value)}
            onBlur={() => onFieldBlur("generalSkills")}
            placeholder="React, Python, Design Thinking"
            className="w-full"
            maxLength={300}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Hackathons Attended So Far
          </label>
          <Input
            type="number"
            min={0}
            value={form.hackathonsAttended}
            onChange={(event) => onUpdateField("hackathonsAttended", event.target.value)}
            onBlur={() => onFieldBlur("hackathonsAttended")}
            placeholder="0"
            className="w-full"
          />
        </div>
      </fieldset>

      {error && <p className="text-sm text-red-400 text-center">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Button type="button" variant="outline" className="w-full" onClick={onPrevStep}>
          Back
        </Button>

        <Button
          type="button"
          className="w-full md:col-span-2"
          disabled={isSubmitting || !isStep2Complete}
          onClick={onNextStep}
        >
          {isSubmitting ? "Saving application..." : "Continue to Step 3"}
        </Button>
      </div>
    </>
  )
}
