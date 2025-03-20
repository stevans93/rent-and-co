export default function FooterSocialBadge({ link, icon }: { link: string, icon: string }) {


    return (
        <a href={link}>
            <i className={`fa-brands ${icon} p-3 rounded-full cursor-pointer transition-colors duration-300 hover:bg-orange`}></i>
        </a>

    )


}