/**
 * UI capability model for Admin / Manager backoffice surfaces.
 * API RBAC is the source of truth; these flags drive which actions the UI exposes.
 */

export type BackofficeCapabilities = {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

export type ClientCapabilities = BackofficeCapabilities & {
  canAddNotes: boolean;
  canAssignPackage: boolean;
  canCreateBooking: boolean;
  canCancelBooking: boolean;
};

export type ScheduleCapabilities = BackofficeCapabilities & {
  canDuplicate: boolean;
  canCancel: boolean;
  canChangeStatus: boolean;
};

export type GiftCardCapabilities = BackofficeCapabilities & {
  canAssign: boolean;
  canActivate: boolean;
  canDeactivate: boolean;
  canResend: boolean;
};

export type NotificationCapabilities = BackofficeCapabilities & {
  canBroadcast: boolean;
  canCancelScheduled: boolean;
  canViewAnalytics: boolean;
};

export type ContentCapabilities = BackofficeCapabilities & {
  canSubmitReview: boolean;
  canReview: boolean;
};

export type BookingCapabilities = BackofficeCapabilities & {
  canCancel: boolean;
};

const ADMIN_BASE: BackofficeCapabilities = {
  canView: true,
  canCreate: true,
  canUpdate: true,
  canDelete: true,
};

const MANAGER_BASE: BackofficeCapabilities = {
  canView: true,
  canCreate: true,
  canUpdate: true,
  canDelete: false,
};

const READ_ONLY_BASE: BackofficeCapabilities = {
  canView: true,
  canCreate: false,
  canUpdate: false,
  canDelete: false,
};

export function adminBackofficeCapabilities(): BackofficeCapabilities {
  return { ...ADMIN_BASE };
}

export function managerBackofficeCapabilities(): BackofficeCapabilities {
  return { ...MANAGER_BASE };
}

export function adminClientCapabilities(): ClientCapabilities {
  return {
    ...ADMIN_BASE,
    canAddNotes: true,
    canAssignPackage: true,
    canCreateBooking: true,
    canCancelBooking: true,
  };
}

export function managerClientCapabilities(): ClientCapabilities {
  return {
    ...MANAGER_BASE,
    canAddNotes: true,
    canAssignPackage: true,
    canCreateBooking: true,
    canCancelBooking: true,
  };
}

export function adminScheduleCapabilities(): ScheduleCapabilities {
  return {
    ...ADMIN_BASE,
    canDuplicate: true,
    canCancel: true,
    canChangeStatus: true,
  };
}

export function managerScheduleCapabilities(): ScheduleCapabilities {
  return {
    ...MANAGER_BASE,
    canDuplicate: true,
    canCancel: true,
    canChangeStatus: true,
  };
}

export function adminGiftCardCapabilities(): GiftCardCapabilities {
  return {
    ...ADMIN_BASE,
    canAssign: true,
    canActivate: true,
    canDeactivate: true,
    canResend: true,
  };
}

export function managerGiftCardCapabilities(): GiftCardCapabilities {
  return {
    ...MANAGER_BASE,
    canAssign: true,
    canActivate: true,
    canDeactivate: true,
    canResend: true,
  };
}

export function adminNotificationCapabilities(): NotificationCapabilities {
  return {
    ...ADMIN_BASE,
    canBroadcast: true,
    canCancelScheduled: true,
    canViewAnalytics: true,
  };
}

export function managerNotificationCapabilities(): NotificationCapabilities {
  return {
    ...MANAGER_BASE,
    canBroadcast: true,
    canCancelScheduled: true,
    canViewAnalytics: false,
  };
}

export function adminContentCapabilities(): ContentCapabilities {
  return { ...ADMIN_BASE, canSubmitReview: true, canReview: true };
}

export function managerContentCapabilities(): ContentCapabilities {
  return { ...MANAGER_BASE, canSubmitReview: true, canReview: true };
}

export function adminBookingCapabilities(): BookingCapabilities {
  return { ...ADMIN_BASE, canCancel: true };
}

export function managerBookingCapabilities(): BookingCapabilities {
  return { ...MANAGER_BASE, canCancel: true };
}

/**
 * Resolve base write caps when a surface still accepts legacy `readOnly`
 * without an explicit capabilities object.
 */
export function resolveBackofficeCapabilities(
  capabilities: BackofficeCapabilities | undefined,
  readOnly: boolean | undefined,
): BackofficeCapabilities {
  if (capabilities) {
    return capabilities;
  }
  if (readOnly) {
    return { ...READ_ONLY_BASE };
  }
  return adminBackofficeCapabilities();
}

/** Default backoffice caps for Admin / Manager roles (others get read-only). */
export function capabilitiesForRole(role: string): BackofficeCapabilities {
  if (role === "ADMIN") {
    return adminBackofficeCapabilities();
  }
  if (role === "MANAGER") {
    return managerBackofficeCapabilities();
  }
  return { ...READ_ONLY_BASE };
}
