import json
import os
from dataclasses import dataclass
from typing import Any
from urllib import error, request


class OpenAIServiceError(Exception):
    pass


@dataclass
class SubtaskSuggestionResult:
    title: str
    subtasks: list[str]


def _resolve_model_name() -> str:
    configured_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()
    aliases = {
        "gpt-4o-min": "gpt-4o-mini",
    }
    return aliases.get(configured_model, configured_model or "gpt-4o-mini")


def _build_payload(title: str) -> dict[str, Any]:
    return {
        "model": _resolve_model_name(),
        "instructions": (
            "You suggest practical subtasks for a task management application. "
            "Return concise subtasks in JSON. Do not return more than 5 subtasks. "
            "Each subtask must be actionable, distinct, and less than 80 characters."
        ),
        "input": f"Suggest up to 5 subtasks for this task title: {title}",
        "text": {
            "format": {
                "type": "json_schema",
                "name": "subtask_suggestions",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string"},
                        "subtasks": {
                            "type": "array",
                            "maxItems": 5,
                            "items": {"type": "string"},
                        },
                    },
                    "required": ["title", "subtasks"],
                    "additionalProperties": False,
                },
            }
        },
    }


def _extract_json_text(response_payload: dict[str, Any]) -> str:
    if response_payload.get("output_text"):
        return response_payload["output_text"]

    for item in response_payload.get("output", []):
        for content in item.get("content", []):
            if content.get("type") == "output_text" and content.get("text"):
                return content["text"]

    raise OpenAIServiceError("OpenAI did not return text content.")


def suggest_subtasks_with_openai(title: str) -> SubtaskSuggestionResult:
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise OpenAIServiceError("OPENAI_API_KEY is not configured.")

    payload = json.dumps(_build_payload(title)).encode("utf-8")
    req = request.Request(
        "https://api.openai.com/v1/responses",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with request.urlopen(req, timeout=30) as response:
            response_payload = json.loads(response.read().decode("utf-8"))
    except error.HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="ignore")
        raise OpenAIServiceError(
            f"OpenAI request failed with status {exc.code}: {error_body}"
        ) from exc
    except error.URLError as exc:
        raise OpenAIServiceError(f"Could not reach OpenAI: {exc.reason}") from exc

    try:
        parsed = json.loads(_extract_json_text(response_payload))
    except json.JSONDecodeError as exc:
        raise OpenAIServiceError("OpenAI returned invalid JSON for subtasks.") from exc

    normalized_subtasks = []
    seen = set()
    for subtask in parsed.get("subtasks", []):
        if not isinstance(subtask, str):
            continue

        cleaned = subtask.strip()
        if not cleaned:
            continue

        key = cleaned.casefold()
        if key in seen:
            continue

        seen.add(key)
        normalized_subtasks.append(cleaned)
        if len(normalized_subtasks) == 5:
            break

    if not normalized_subtasks:
        raise OpenAIServiceError("OpenAI did not return any usable subtasks.")

    normalized_title = parsed.get("title", title)
    if not isinstance(normalized_title, str) or not normalized_title.strip():
        normalized_title = title

    return SubtaskSuggestionResult(
        title=normalized_title.strip(),
        subtasks=normalized_subtasks,
    )
