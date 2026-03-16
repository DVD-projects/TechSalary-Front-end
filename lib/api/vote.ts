export type VoteType = "UP" | "DOWN";

export interface VotePayload {
  salary_submission_id: number;
  vote_type: VoteType;
}

export interface VoteResponse {
  up_votes: number;
  down_votes: number;
  score?: number;
  status?: string;
  [key: string]: unknown;
}

const API_BASE_URL = "http://127.0.0.1:8001";

export class VoteService {
  private static getHeaders() {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Unauthorized");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  static async createVote(
    salaryId: number | string,
    voteType: VoteType
  ): Promise<VoteResponse> {
    const payload: VotePayload = {
      salary_submission_id: parseInt(String(salaryId), 10),
      vote_type: voteType,
    };

    const response = await fetch(`${API_BASE_URL}/vote/Add`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      if (response.status === 401) {
        throw new Error(errorData?.detail || "Unauthorized");
      }

      throw new Error(errorData?.detail || "Vote failed");
    }

    return (await response.json()) as VoteResponse;
  }

  static async deleteVote(
    salaryId: number | string,
    voteType: VoteType
  ): Promise<VoteResponse> {
    const payload: VotePayload = {
      salary_submission_id: parseInt(String(salaryId), 10),
      vote_type: voteType,
    };

    const response = await fetch(`${API_BASE_URL}/vote/Delete`, {
      method: "DELETE",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      if (response.status === 401) {
        throw new Error(errorData?.detail || "Unauthorized");
      }

      throw new Error(errorData?.detail || "Delete vote failed");
    }

    return (await response.json()) as VoteResponse;
  }
}
