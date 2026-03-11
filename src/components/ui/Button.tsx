import { motion, type HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<'button'> {
    variant?: 'primary' | 'outline' | 'white';
}

const Button = ({
    variant = 'primary',
    className = '',
    children,
    ...props
}: ButtonProps) => {
    const baseStyles = 'px-8 py-3 font-medium transition-all duration-300 uppercase tracking-widest text-sm inline-block';

    const variants = {
        primary: 'bg-luxury-red text-white hover:bg-black',
        outline: 'border-2 border-white text-white hover:bg-white hover:text-dark-navy',
        'dark-outline': 'border border-black/10 text-black hover:border-black transition-all',
        white: 'bg-white text-luxury-red hover:bg-black hover:text-white',
    };

    return (
        <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default Button;
