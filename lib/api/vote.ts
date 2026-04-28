export type VoteType = "up" | "down";
type ApiVoteType = "UP" | "DOWN";

export interface VotePayload {
  salary_submission_id: number;
  vote_type: ApiVoteType;
}

export interface VoteResponse {
  up_votes: number;
  down_votes: number;
  score?: number;
  status?: string;
  [key: string]: unknown;
}

export interface UserInteractionStateResponse {
  user_vote: ApiVoteType | null;
  reported: boolean;
  up_votes: number;
  down_votes: number;
}

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

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

  private static normalizeVoteType(voteType: VoteType): ApiVoteType {
    return voteType.toUpperCase() as ApiVoteType;
  }

  static async vote(salaryId: number | string, voteType: VoteType) {
    const data = await this.createVote(salaryId, voteType);

    return {
      success: true,
      data: {
        upvotes: data.up_votes,
        downvotes: data.down_votes,
      },
    };
  }

  static async getUserInteractionState(
    salaryId: number | string
  ): Promise<UserInteractionStateResponse> {
    const response = await fetch(`${API_BASE_URL}/vote/State/${salaryId}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      if (response.status === 401) {
        throw new Error(errorData?.detail || "Unauthorized");
      }

      throw new Error(errorData?.detail || "Failed to load vote state");
    }

    return (await response.json()) as UserInteractionStateResponse;
  }

  static async createVote(
    salaryId: number | string,
    voteType: VoteType
  ): Promise<VoteResponse> {
    const payload: VotePayload = {
      salary_submission_id: parseInt(String(salaryId), 10),
      vote_type: this.normalizeVoteType(voteType),
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
      vote_type: this.normalizeVoteType(voteType),
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
