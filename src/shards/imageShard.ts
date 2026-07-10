import { Shard, ShardContext } from "./shard";

export interface ImageShardContext extends ShardContext {
    src: string;
    alt?: string;
}

export class ImageShard extends Shard<ImageShardContext> {
    private modal: HTMLDivElement | null = null;

    override generateBody(): Record<keyof NonNullable<ImageShardContext["modules"]>, HTMLElement | SVGElement> {
        const { src, alt = "", width, height } = this.context;

        const img = document.createElement("img");
        img.src = src;
        img.alt = alt;
        img.style.cursor = "zoom-in";
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.addEventListener("click", () => this.openModal(src, alt));

        return {
            base: img
        };
    }

    private openModal(src: string, alt: string) {
        this.closeModal();

        this.modal = document.createElement("div");
        this.modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        const modalContent = document.createElement("div");
        modalContent.style.cssText = `
            position: relative;
            max-width: 90vw;
            max-height: 90vh;
            transform: scale(0.7);
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        `;

        const bigImg = document.createElement("img");
        bigImg.src = src;
        bigImg.alt = alt;
        bigImg.style.cssText = `
            max-width: 100%;
            max-height: 90vh;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
        `;

        const closeBtn = document.createElement("button");
        closeBtn.innerHTML = "✕";
        closeBtn.style.cssText = `
            position: absolute;
            top: -15px;
            right: -15px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: white;
            color: black;
            font-size: 20px;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
        `;

        modalContent.appendChild(bigImg);
        modalContent.appendChild(closeBtn);
        this.modal.appendChild(modalContent);
        document.body.appendChild(this.modal);

        setTimeout(() => {
            this.modal!.style.opacity = "1";
            modalContent.style.transform = "scale(1)";
        }, 10);

        const close = () => this.closeModal();

        closeBtn.addEventListener("click", close);
        this.modal.addEventListener("click", (e) => {
            if (e.target === this.modal) close();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") close();
        }, { once: true });
    }

    private closeModal() {
        if (!this.modal) return;

        this.modal.style.opacity = "0";

        setTimeout(() => {
            this.modal?.remove();
            this.modal = null;
        }, 300);
    }
}