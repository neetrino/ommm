export type CoachPanelClient = {
  id: string;
  name: string | null;
  lastName: string | null;
  bookingCount: number;
  lastSessionAt: string | null;
};

export type CoachPanelClientsPayload = {
  items: CoachPanelClient[];
};

/** Visible name for a coach's client row. Falls back when both name parts are empty. */
export function coachClientDisplayName(
  client: Pick<CoachPanelClient, "name" | "lastName">,
  fallback: string,
): string {
  const label = [client.name, client.lastName]
    .filter((part): part is string => part !== null && part.trim().length > 0)
    .join(" ");
  return label.length > 0 ? label : fallback;
}

export function filterCoachClients(
  clients: readonly CoachPanelClient[],
  search: string,
): CoachPanelClient[] {
  const needle = search.trim().toLocaleLowerCase();
  if (needle.length === 0) {
    return [...clients];
  }
  return clients.filter((client) =>
    coachClientDisplayName(client, "").toLocaleLowerCase().includes(needle),
  );
}
