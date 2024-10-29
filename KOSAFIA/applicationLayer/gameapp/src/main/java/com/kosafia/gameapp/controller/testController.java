import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/")

public class testController {


    @GetMapping("")
    public void helloworld(){
        System.out.println("hello wolrd");
    }
}
