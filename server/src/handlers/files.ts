import fs from 'fs/promises';
import path from 'path';
import { Buffer } from 'buffer';
import { Handler } from '../router';
import { parseJsonBody, sendJson, sendError } from '../http';
import { NotFoundError, BadRequestError } from '../errors';
import { withDb } from '../db';
import { generateId, nowISO } from '../../../shared/utils';
import { FileObject, Attachment, Agreement } from '../../../shared/domain';

const FILES_DIR = path.join((process as any).cwd(), 'data', 'files');

export const uploadFile: Handler = async (req, res) => {
  const body = await parseJsonBody(req); // { filename, mimeType, contentBase64 }
  
  if (!body.filename || !body.contentBase64) throw new BadRequestError('Missing file data');

  const fileId = generateId('file');
  const buffer = Buffer.from(body.contentBase64, 'base64');
  const storagePath = path.join(FILES_DIR, fileId);

  // Write to disk
  await fs.writeFile(storagePath, buffer);

  await withDb(db => {
    const file: FileObject = {
      id: fileId,
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: [],
      originalName: body.filename,
      mimeType: body.mimeType || 'application/octet-stream',
      sizeBytes: buffer.length,
      storagePath: fileId, // Relative to FILES_DIR
      publicUrl: `/api/files/${fileId}/download`
    };

    db.files.push(file);
    
    // Audit log
    db.auditLogs.push({
      id: generateId('al'),
      actorId: req.user!.id,
      action: 'file.upload',
      resourceType: 'File',
      resourceId: fileId,
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: []
    });

    sendJson(res, 201, { data: file });
  });
};

export const downloadFile: Handler = async (req, res, params) => {
  const { id } = params;
  
  const db = await import('../db').then(m => m.loadDb());
  const file = db.files.find(f => f.id === id);
  
  if (!file) throw new NotFoundError('File not found');

  const filePath = path.join(FILES_DIR, file.storagePath);
  
  try {
    const fileData = await fs.readFile(filePath);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Length', fileData.length);
    res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
    res.writeHead(200);
    res.end(fileData);
  } catch (e) {
    throw new NotFoundError('File content missing');
  }
};

export const createAttachment: Handler = async (req, res) => {
  const body = await parseJsonBody(req); // { entityType, entityId, fileId, label }
  
  if (!body.entityId || !body.fileId) throw new BadRequestError('Missing fields');

  await withDb(db => {
    const attachment: Attachment = {
      id: generateId('att'),
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: [],
      entityType: body.entityType,
      entityId: body.entityId,
      fileId: body.fileId,
      label: body.label
    };

    db.attachments.push(attachment);
    sendJson(res, 201, { data: attachment });
  });
};

export const listAttachments: Handler = async (req, res) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const entityType = url.searchParams.get('entityType');
  const entityId = url.searchParams.get('entityId');

  await withDb(db => {
    let list = db.attachments.filter(a => a.orgId === req.user!.orgId);
    if (entityType) list = list.filter(a => a.entityType === entityType);
    if (entityId) list = list.filter(a => a.entityId === entityId);
    
    // Enrich with file info
    const enriched = list.map(att => {
        const file = db.files.find(f => f.id === att.fileId);
        return { ...att, file };
    });

    sendJson(res, 200, { data: enriched });
  });
};

// --- Agreements ---

export const listAgreements: Handler = async (req, res, params) => {
  const { id } = params; // Owner ID
  await withDb(db => {
    const list = db.agreements.filter(a => a.ownerId === id);
    sendJson(res, 200, { data: list });
  });
};

export const createAgreement: Handler = async (req, res) => {
  const body = await parseJsonBody(req); // { ownerId, name, fileId }
  
  await withDb(db => {
    const agreement: Agreement = {
      id: generateId('agr'),
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: [],
      ownerId: body.ownerId,
      name: body.name,
      status: 'Signed',
      signedAt: nowISO(),
      fileId: body.fileId
    };
    
    db.agreements.push(agreement);
    sendJson(res, 201, { data: agreement });
  });
};

// --- Report Cards ---

export const listReportCards: Handler = async (req, res) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const petId = url.searchParams.get('petId');
  const date = url.searchParams.get('date');

  await withDb(db => {
    let cards = db.reportCards.filter(c => c.orgId === req.user!.orgId);
    if (petId) cards = cards.filter(c => c.petId === petId);
    if (date) cards = cards.filter(c => c.date.startsWith(date));
    
    sendJson(res, 200, { data: cards });
  });
};

export const createReportCard: Handler = async (req, res) => {
  const body = await parseJsonBody(req);
  
  await withDb(db => {
    const card = {
      id: generateId('rc'),
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: [],
      status: 'Draft',
      petId: body.petId,
      staffId: req.user!.id,
      date: body.date || nowISO(),
      mood: 'Happy',
      activities: [],
      eating: 'All',
      potty: [],
      notes: '',
      ...body
    };
    
    db.reportCards.push(card);
    sendJson(res, 201, { data: card });
  });
};

export const updateReportCard: Handler = async (req, res, params) => {
  const { id } = params;
  const body = await parseJsonBody(req);
  
  await withDb(db => {
    const idx = db.reportCards.findIndex(c => c.id === id);
    if (idx === -1) throw new NotFoundError();
    
    db.reportCards[idx] = { ...db.reportCards[idx], ...body, updatedAt: nowISO() };
    sendJson(res, 200, { data: db.reportCards[idx] });
  });
};

export const addReportCardMedia: Handler = async (req, res, params) => {
  const { id } = params;
  const body = await parseJsonBody(req); // { fileId, type }
  
  await withDb(db => {
    const media = {
      id: generateId('rcm'),
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: [],
      reportCardId: id,
      fileId: body.fileId,
      type: body.type || 'Photo'
    };
    
    db.reportCardMedia.push(media);
    sendJson(res, 201, { data: media });
  });
};

export const listReportCardMedia: Handler = async (req, res, params) => {
  const { id } = params;
  await withDb(db => {
    // Return full media info including public URLs
    const media = db.reportCardMedia
      .filter(m => m.reportCardId === id)
      .map(m => {
        const file = db.files.find(f => f.id === m.fileId);
        return { ...m, url: file?.publicUrl };
      });
      
    sendJson(res, 200, { data: media });
  });
};