from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    odcloud_service_key: str = ""
    odcloud_api_base: str = "https://api.odcloud.kr/api"
    odcloud_dataset_path: str = (
        "/15151579/v1/uddi:1bf91dbe-a17f-44aa-9141-a93057b8100f"
    )
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
