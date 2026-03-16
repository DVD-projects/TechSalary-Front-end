export interface ReportPayload {
  salary_submission_id: number
  reason: string
}

export interface DeleteReportPayload {
  salary_submission_id: number
}

export interface ReportResponse {
  message: string
  total_reports?: number
  status?: string
  [key: string]: unknown
}

const API_BASE_URL = "http://127.0.0.1:8001"

class BaseReportService {
  protected static getHeaders() {
    const token = localStorage.getItem("token")

    if (!token) {
      throw new Error("Unauthorized")
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }
}

export class ReportService extends BaseReportService {
  static async createReport(
    salaryId: number | string,
    reason: string
  ): Promise<ReportResponse> {
    const payload: ReportPayload = {
      salary_submission_id: parseInt(String(salaryId), 10),
      reason,
    }

    const response = await fetch(`${API_BASE_URL}/vote/Report`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)

      if (response.status === 401) {
        throw new Error(errorData?.detail || "Unauthorized")
      }

      throw new Error(errorData?.detail || "Report failed")
    }

    return response.json()
  }

  static async deleteReport(
    salaryId: number | string
  ): Promise<ReportResponse> {
    const payload: DeleteReportPayload = {
      salary_submission_id: parseInt(String(salaryId), 10),
    }

    const response = await fetch(`${API_BASE_URL}/vote/Report`, {
      method: "DELETE",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)

      if (response.status === 401) {
        throw new Error(errorData?.detail || "Unauthorized")
      }

      throw new Error(errorData?.detail || "Delete report failed")
    }

    return response.json()
  }
}
