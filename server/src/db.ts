
import fs from 'fs/promises';
import path from 'path';
import { 
  UserAccount, Owner, Pet, Reservation, KennelUnit, 
  CatalogItem, Invoice, Payment, FileObject, Attachment,
  ReservationSegment, ReservationLineItem, ReportCard,
  AuditLog, DomainEvent, Workflow, WorkflowRun, InvoiceLineItem,
  ReportCardMedia, Estimate, EstimateLineItem, Agreement,
  Notification, NotificationComment, MessageThread, Message
} from '../../shared/domain';

const DB_PATH = path.join((process as any).cwd(), 'data', 'db.json');
const DATA_DIR = path.join((process as any).cwd(), 'data');

export interface DbSchema {
  meta: { version: number };
  users: UserAccount[];
  owners: Owner[];
  agreements: Agreement[];
  pets: Pet[];
  kennelUnits: KennelUnit[];
  catalogItems: CatalogItem[];
  reservations: Reservation[];
  reservationSegments: ReservationSegment[];
  reservationLineItems: ReservationLineItem[];
  
  estimates: Estimate[];
  estimateLineItems: EstimateLineItem[];
  invoices: Invoice[];
  invoiceLineItems: InvoiceLineItem[];
  payments: Payment[];
  
  files: FileObject[];
  attachments: Attachment[];
  reportCards: ReportCard[];
  reportCardMedia: ReportCardMedia[];
  
  notifications: Notification[];
  notificationComments: NotificationComment[];
  messageThreads: MessageThread[];
  messages: Message[];
  
  auditLogs: AuditLog[];
  events: DomainEvent[];
  workflows: Workflow[];
  workflowRuns: WorkflowRun[];
}

const INITIAL_DB: DbSchema = {
  meta: { version: 1 },
  users: [],
  owners: [],
  agreements: [],
  pets: [],
  kennelUnits: [],
  catalogItems: [],
  reservations: [],
  reservationSegments: [],
  reservationLineItems: [],
  estimates: [],
  estimateLineItems: [],
  invoices: [],
  invoiceLineItems: [],
  payments: [],
  files: [],
  attachments: [],
  reportCards: [],
  reportCardMedia: [],
  notifications: [],
  notificationComments: [],
  messageThreads: [],
  messages: [],
  auditLogs: [],
  events: [],
  workflows: [],
  workflowRuns: []
};

let dbCache: DbSchema | null = null;

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(path.join(DATA_DIR, 'files'), { recursive: true });
  } catch (e) {
    // Ignore if exists
  }
}

export async function loadDb(): Promise<DbSchema> {
  if (dbCache) return dbCache;
  
  await ensureDataDir();
  
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    dbCache = JSON.parse(data);
    return dbCache!;
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      // Create new
      await saveDb(INITIAL_DB);
      return INITIAL_DB;
    }
    throw e;
  }
}

export async function saveDb(data: DbSchema): Promise<void> {
  await ensureDataDir();
  const tempPath = `${DB_PATH}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tempPath, DB_PATH);
  dbCache = data;
}

// Helper to safely mutate DB
export async function withDb<T>(mutator: (db: DbSchema) => Promise<T> | T): Promise<T> {
  const db = await loadDb();
  const result = await mutator(db);
  await saveDb(db);
  return result;
}
