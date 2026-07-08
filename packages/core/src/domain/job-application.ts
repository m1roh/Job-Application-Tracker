import type { CompanyName } from "./value-objects/company-name";
import type { JobApplicationId } from "./value-objects/job-application-id";

export type ApplicationStatus =
  | "to_contact"
  | "offer_open"
  | "application_sent"
  | "follow_up_sent"
  | "hr_interview"
  | "technical_interview"
  | "offer_received"
  | "rejected"
  | "on_hold"
  | "withdrawn";

export type StatusChange = {
  previousStatus: ApplicationStatus;
  newStatus: ApplicationStatus;
  date: Date;
};

const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  to_contact: ["offer_open", "application_sent", "withdrawn"],
  offer_open: ["application_sent", "withdrawn"],
  application_sent: ["follow_up_sent", "hr_interview", "rejected", "on_hold", "withdrawn"],
  follow_up_sent: ["hr_interview", "rejected", "on_hold", "withdrawn"],
  hr_interview: ["technical_interview", "rejected", "on_hold"],
  technical_interview: ["offer_received", "rejected", "on_hold"],
  on_hold: [],
  offer_received: [],
  rejected: [],
  withdrawn: [],
};

const STATUSES_ALLOWING_FOLLOW_UP: ApplicationStatus[] = ["application_sent", "follow_up_sent"];

type JobApplicationProps = {
  id: JobApplicationId;
  company: CompanyName;
  position: string;
  status: ApplicationStatus;
  applicationDate: Date | null;
  nextFollowUp: Date | null;
  offerUrl: string | null;
  notes: string;
  history: StatusChange[];
};

export type JobApplicationSnapshot = JobApplicationProps;

export class JobApplication {
  private constructor(private readonly props: JobApplicationProps) {}

  static create(
    params: {
      id: JobApplicationId;
      company: CompanyName;
      position: string;
      applicationDate?: Date | null;
      offerUrl?: string | null;
      notes?: string;
    },
    now: Date,
  ): JobApplication {
    if (params.position.trim().length === 0) {
      throw new Error("Invalid JobApplication: position cannot be empty");
    }

    const applicationDate = params.applicationDate ?? null;
    if (applicationDate !== null && applicationDate.getTime() > now.getTime()) {
      throw new Error("Invalid JobApplication: applicationDate cannot be in the future");
    }

    return new JobApplication({
      id: params.id,
      company: params.company,
      position: params.position,
      status: "to_contact",
      applicationDate,
      nextFollowUp: null,
      offerUrl: params.offerUrl ?? null,
      notes: params.notes ?? "",
      history: [],
    });
  }

  static reconstitute(snapshot: JobApplicationSnapshot): JobApplication {
    return new JobApplication(snapshot);
  }

  private allowedDestinations(): ApplicationStatus[] {
    if (this.props.status === "on_hold") {
      const lastChange = this.props.history.at(-1);
      if (!lastChange) {
        throw new Error("Invalid JobApplication: on_hold status with no history entry");
      }
      return [lastChange.previousStatus];
    }

    return VALID_TRANSITIONS[this.props.status];
  }

  allowedNextStatuses(): ApplicationStatus[] {
    return this.allowedDestinations();
  }

  changeStatus(newStatus: ApplicationStatus, now: Date): JobApplication {
    if (!this.allowedDestinations().includes(newStatus)) {
      throw new Error(`Invalid transition: ${this.props.status} → ${newStatus}`);
    }

    const change: StatusChange = {
      previousStatus: this.props.status,
      newStatus,
      date: now,
    };

    return new JobApplication({
      ...this.props,
      status: newStatus,
      history: [...this.props.history, change],
      nextFollowUp: STATUSES_ALLOWING_FOLLOW_UP.includes(newStatus) ? this.props.nextFollowUp : null,
    });
  }

  planFollowUp(date: Date): JobApplication {
    if (!STATUSES_ALLOWING_FOLLOW_UP.includes(this.props.status)) {
      throw new Error(`Invalid JobApplication: cannot plan a follow-up while status is ${this.props.status}`);
    }

    return new JobApplication({ ...this.props, nextFollowUp: date });
  }

  get id(): JobApplicationId {
    return this.props.id;
  }

  get company(): CompanyName {
    return this.props.company;
  }

  get position(): string {
    return this.props.position;
  }

  get status(): ApplicationStatus {
    return this.props.status;
  }

  get applicationDate(): Date | null {
    return this.props.applicationDate;
  }

  get nextFollowUp(): Date | null {
    return this.props.nextFollowUp;
  }

  get offerUrl(): string | null {
    return this.props.offerUrl;
  }

  get notes(): string {
    return this.props.notes;
  }

  get history(): StatusChange[] {
    return [...this.props.history];
  }

  equals(other: JobApplication): boolean {
    return this.props.id.equals(other.props.id);
  }
}
