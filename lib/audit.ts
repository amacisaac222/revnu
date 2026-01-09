import { db } from './db'

export async function logAudit(params: {
  organizationId: string
  action: string
  entityType?: string
  entityId?: string
  metadata?: Record<string, any>
  userId?: string
  ipAddress?: string
  userAgent?: string
}) {
  return await db.auditLog.create({
    data: {
      organizationId: params.organizationId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata || {},
      userId: params.userId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  })
}
