// CH03 - BEFORE: the stubbed encoder from config/SecurityConfiguration.java:57-77.
// encode() returns plaintext; matches() compares plaintext. Insecure - the
// concrete Strategy defeats its own purpose.
    private PasswordEncoder getPasswordEncoder() {
        return new BCryptPasswordEncoder() {
            @Override
            public String encode(CharSequence charSequence) {
            	System.out.println("Encode: "+charSequence);
                return charSequence.toString();
            }

            @Override
            public boolean matches(CharSequence charSequence, String s) {
            	System.out.println("Matches: "+charSequence);
            	System.out.println("Matches: "+s);
//            	PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
//            	String hashedPassword = passwordEncoder.encode(charSequence);
//            	System.out.println("Matches: "+hashedPassword);
            	if(charSequence.equals(s))
                    return true;
            	else
            		return false;
            }
        };
